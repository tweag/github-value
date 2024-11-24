import { CronJob, CronTime } from 'cron';
import logger from './logger.js';
import { insertUsage } from '../models/usage.model.js';
import SeatService, { SeatEntry } from '../services/copilot.seats.service.js';
import { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';
import metricsService from './metrics.service.js';
import { MetricDailyResponseType } from '../models/metrics.model.js';
import teamsService from './teams.service.js';

const DEFAULT_CRON_EXPRESSION = '0 * * * *';
class QueryService {
  cronJob: CronJob;
  status = {
    usage: false,
    metrics: false,
    copilotSeats: false,
    teamsAndMembers: false,
    dbInitialized: false
  };

  constructor(
    public installation: Endpoints["GET /app/installations"]["response"]["data"][0],
    public octokit: Octokit
  ) {
    this.cronJob = new CronJob(DEFAULT_CRON_EXPRESSION, this.task, null, true);
    this.task();
  }

  private async task() {
    try {
      if (!this.installation.account?.login) throw new Error('No installation found');
      const queries = [
        this.queryCopilotUsageMetrics().then(() =>
          this.status.usage = true
        ),
        this.queryCopilotUsageMetricsNew(this.installation.account?.login).then(() =>
          this.status.metrics = true
        ),
        this.queryCopilotSeatAssignments().then(() =>
          this.status.copilotSeats = true
        ),
      ]

      const lastUpdated = await teamsService.getLastUpdatedAt();
      const elapsedHours = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      logger.info(`It's been ${Math.floor(elapsedHours)} hours since last update 🕒`);
      if (true || elapsedHours > 24) {
        queries.push(
          this.queryTeamsAndMembers().then(() =>
            this.status.teamsAndMembers = true
          )
        );
      } else {
        this.status.teamsAndMembers = true
      }

      await Promise.all(queries);
      this.status.dbInitialized = true;
    } catch (error) {
      logger.error(error);
    }
  }

  public async queryCopilotUsageMetricsNew(org: string, team?: string) {
    try {
      const metricsArray = await this.octokit.paginate<MetricDailyResponseType>(
        'GET /orgs/{org}/copilot/metrics',
        {
          org: org
        }
      );
      await metricsService.insertMetrics(org, metricsArray, team);
      logger.info("Metrics successfully updated! 📈");
    } catch (error) {
      logger.error('Error querying copilot metrics', error);
    }
  }

  public async queryCopilotUsageMetrics() {
    if (!this.installation.account?.login) throw new Error('No installation found')
    try {
      const response = await this.octokit.rest.copilot.usageMetricsForOrg({
        org: this.installation.account?.login
      });

      insertUsage(this.installation.account?.login, response.data);
      logger.info("Usage successfully updated! 📈");
    } catch (error) {
      logger.error('Error querying copilot metrics', error);
    }
  }

  public async queryCopilotSeatAssignments() {
    if (!this.installation.account?.login) throw new Error('No installation found')
    try {
      const _seatAssignments = await this.octokit.paginate(this.octokit.rest.copilot.listCopilotSeats, {
        org: this.installation.account?.login
      }) as { total_seats: number, seats: SeatEntry[] }[];
      const seatAssignments = {
        total_seats: _seatAssignments[0]?.total_seats || 0,
        seats: (_seatAssignments).reduce((acc, rsp) => acc.concat(rsp.seats), [] as SeatEntry[])
      };

      if (!seatAssignments.seats) {
        logger.info(`No seat assignment data found.`);
        return;
      }

      SeatService.insertSeats(this.installation.account.login, seatAssignments.seats);

      logger.info("Seat assignments successfully updated! 🪑");
    } catch (error) {
      logger.error('Error querying copilot seat assignments', error);
    }
  }

  public async queryTeamsAndMembers() {
    if (!this.installation.account?.login) throw new Error('No installation found')
    const members = await this.octokit.paginate("GET /orgs/{org}/members", {
      org: this.installation.account.login
    });
    await teamsService.updateMembers(this.installation.account.login, members);
    try {
      const teams = await this.octokit.paginate(this.octokit.rest.teams.list, {
        org: this.installation.account.login
      });
      await teamsService.updateTeams(this.installation.account.login, teams);

      await Promise.all(
        teams.map(async (team) => this.octokit.paginate(this.octokit.rest.teams.listMembersInOrg, {
          org: this.installation.account!.login,
          team_slug: team.slug
        })
          .then((members) => Promise.all(
            members.map(async (member) => teamsService.addMemberToTeam(team.id, member.id))
          ))
          .catch((error) => {
            logger.debug(error);
            logger.error('Error updating team members for team', { team: team, error: error });
          })
        )
      );

      logger.info("Teams & Members successfully updated! 🧑‍🤝‍🧑");
    } catch (error) {
      logger.error('Error querying teams', error);
    }
  }

  public updateCronJob(cronExpression: string) {
    if (!this.cronJob) return;
    if (!cronExpression) cronExpression = DEFAULT_CRON_EXPRESSION;
    this.cronJob.setTime(new CronTime(cronExpression));
  }
}

export {
  QueryService
}

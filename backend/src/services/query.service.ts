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
    // Consider Timezone
    this.cronJob = new CronJob(DEFAULT_CRON_EXPRESSION, this.task, null, true);
    this.task();
  }

  delete() {
    this.cronJob.stop();
  }

  private async task() {
    try {
      if (!this.installation?.account?.login) throw new Error('No installation found');
      const org = this.installation.account?.login;
      const queries = [
        this.queryCopilotUsageMetrics(org).then(() => this.status.usage = true),
        this.queryCopilotUsageMetricsNew(org).then(() => this.status.metrics = true),
        this.queryCopilotSeatAssignments(org).then(() => this.status.copilotSeats = true),
      ]

      const lastUpdated = await teamsService.getLastUpdatedAt();
      const elapsedHours = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      logger.info(`It's been ${Math.floor(elapsedHours)} hours since last update 🕒`);
      if (true || elapsedHours > 24) {
        queries.push(
          this.queryTeamsAndMembers(org).then(() =>
            this.status.teamsAndMembers = true
          )
        );
      } else {
        this.status.teamsAndMembers = true
      }

      await Promise.all(queries).then(() => {
        this.status.dbInitialized = true;
      });
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

  public async queryCopilotUsageMetrics(org: string) {
    try {
      const rsp = await this.octokit.rest.copilot.usageMetricsForOrg({
        org
      });

      insertUsage(org, rsp.data);
      logger.info("Usage successfully updated! 📈");
    } catch (error) {
      logger.error('Error querying copilot metrics', error);
    }
  }

  public async queryCopilotSeatAssignments(org: string) {
    try {
      const rsp = await this.octokit.paginate(this.octokit.rest.copilot.listCopilotSeats, {
        org
      }) as { total_seats: number, seats: SeatEntry[] }[];

      const seatAssignments = {
        total_seats: rsp[0]?.total_seats || 0,
        seats: (rsp).reduce((acc, rsp) => acc.concat(rsp.seats), [] as SeatEntry[])
      };

      if (!seatAssignments.seats) {
        logger.info(`No seat assignment data found.`);
        return;
      }

      await SeatService.insertSeats(org, seatAssignments.seats);

      logger.info("Seat assignments successfully updated! 🪑");
    } catch (error) {
      logger.error('Error querying copilot seat assignments', error);
    }
  }

  public async queryTeamsAndMembers(org: string) {
    const members = await this.octokit.paginate("GET /orgs/{org}/members", {
      org
    });
    await teamsService.updateMembers(org, members);
    try {
      const teams = await this.octokit.paginate(this.octokit.rest.teams.list, {
        org
      });
      await teamsService.updateTeams(org, teams);

      await Promise.all(
        teams.map(async (team) => this.octokit.paginate(this.octokit.rest.teams.listMembersInOrg, {
          org,
          team_slug: team.slug
        }).then((members) =>
          Promise.all(
            members.map(async (member) => teamsService.addMemberToTeam(team.id, member.id))
          )).catch((error) => {
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

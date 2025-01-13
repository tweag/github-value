import { CronJob, CronJobParams, CronTime } from 'cron';
import logger from './logger.js';
import { insertUsage } from '../models/usage.model.js';
import SeatService, { SeatEntry } from '../services/copilot.seats.service.js';
import { Octokit } from 'octokit';
import { MetricDailyResponseType } from '../models/metrics.model.js';
import mongoose from 'mongoose';
import metricsService from './metrics.service.js';
import teamsService from './teams.service.js';
import AdoptionService from './adoption.service.js';

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
    public org: string,
    public octokit: Octokit,
    options?: Partial<CronJobParams>
  ) {
    // Consider Timezone
    const _options: CronJobParams = {
      cronTime: DEFAULT_CRON_EXPRESSION,
      onTick: () => {
        this.task(this.org);
      },
      start: true,
      ...options
    }
    this.cronJob = CronJob.from(_options);
    this.task(this.org);
  }

  delete() {
    this.cronJob.stop();
  }

  private async task(org: string) {
    const queryAt = new Date();
    try {
      const queries = [
        this.queryCopilotUsageMetrics(org).then(() => this.status.usage = true),
        this.queryCopilotUsageMetricsNew(org).then(() => this.status.metrics = true),
        this.queryCopilotSeatAssignments(org, queryAt).then(() => this.status.copilotSeats = true),
      ]

      this.queryTeamsAndMembers(org).then(() =>
        this.status.teamsAndMembers = true
      )

      await Promise.all(queries).then(() => {
        this.status.dbInitialized = true;
      });
    } catch (error) {
      logger.error(error);
    }
    logger.info(`${org} finished task`);
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
      logger.info(`${org} metrics updated`);
    } catch (error) {
      logger.error(org, `Error updating ${org} metrics`, error);
    }
  }

  public async queryCopilotUsageMetrics(org: string) {
    try {
      const rsp = await this.octokit.rest.copilot.usageMetricsForOrg({
        org
      });

      insertUsage(org, rsp.data);
      logger.info(`${this.org} usage metrics updated`);
    } catch (error) {
      logger.error(`Error updating ${this.org} usage metrics`, error);
    }
  }

  public async queryCopilotSeatAssignments(org: string, queryAt: Date) {
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

      const seatIds = await SeatService.insertSeats(org, queryAt, seatAssignments.seats);

      const adoptionData = seatAssignments.seats.reduce((acc, activity) => {
        if (!activity.last_activity_at) {
          acc.totalInactive++;
          return acc;
        }
        const daysInactive = 30;
        const fromTime = (new Date(activity.last_activity_at)).getTime() || 0;
        const toTime = queryAt.getTime();
        const diff = Math.floor((toTime - fromTime) / 86400000);
        const dateIndex = new Date(queryAt);
        dateIndex.setUTCMinutes(0, 0, 0);
        if (activity.last_activity_at && activity.last_activity_editor) {
          if (diff > daysInactive) {
            acc.totalActive++;
          } else {
            acc.totalInactive++;
          }
        }
        return acc;
      }, {
        date: queryAt,
        totalSeats: seatAssignments.total_seats,
        totalActive: 0,
        totalInactive: 0,
        seats: seatIds
      });

      //tmp
      // const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      // while (1) {
      //   const queryAt = new Date();
      //   console.log('again!');
      //   await AdoptionService.createAdoption({
      //     date: queryAt,
      //     totalSeats: seatAssignments.total_seats,
      //     totalActive: seatAssignments.seats.filter(seat => seat).length,
      //     totalInactive: seatAssignments.seats.filter(seat => seat).length,
      //     seats: seatIds
      //   });
      //   await sleep(100);
      // }
      //endtmp

      await AdoptionService.createAdoption(adoptionData);

      logger.info(`${org} seat assignments updated`);
    } catch (error) {
      console.log(error);
      logger.debug(error)
      logger.error('Error querying copilot seat assignments');
    }
  }

  public async queryTeamsAndMembers(org: string) {
    try {
      const teams = await this.octokit.paginate(this.octokit.rest.teams.list, {
        org
      });
      await teamsService.updateTeams(org, teams);

      await Promise.all(
        teams.map(async (team) => this.octokit.paginate(this.octokit.rest.teams.listMembersInOrg, {
          org,
          team_slug: team.slug
        }).then(async (members) =>
          await Promise.all(
            members.map(async (member) => teamsService.addMemberToTeam(team.id, member.id))
          )).catch((error) => {
            logger.debug(error);
            logger.error('Error updating team members for team', { team: team, error: error });
          })
        )
      )

      const members = await this.octokit.paginate("GET /orgs/{org}/members", {
        org
      });

      const Members = mongoose.model('Member');

      // Use bulkWrite with updateOne operations
      const bulkOps = members.map((member) => ({
        updateOne: {
          filter: { org, id: member.id },
          update: member,
          upsert: true
        }
      }));

      await Members.bulkWrite(bulkOps, { ordered: false });

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

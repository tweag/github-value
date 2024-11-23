import { CronJob, CronTime } from 'cron';
import logger from './logger.js';
import { insertUsage } from '../models/usage.model.js';
import SeatService from '../services/copilot.seats.service.js';
import { insertMetrics } from '../models/metrics.model.js';
import { CopilotMetrics } from '../models/metrics.model.interfaces.js';
import { getLastUpdatedAt, Member, Team, TeamMemberAssociation } from '../models/teams.model.js';
import { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';

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
      
      const lastUpdated = await getLastUpdatedAt();
      const elapsedHours = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      logger.info(`It's been ${Math.floor(elapsedHours)} hours since last update 🕒`);
      if (elapsedHours > 24) {
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

  public async queryCopilotUsageMetricsNew(org: string) {
    try {
      const response = await this.octokit.paginate<CopilotMetrics>('GET /orgs/{org}/copilot/metrics', {
        org: org
      });
      const metricsArray = response;

      await insertMetrics(metricsArray);

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

      insertUsage(response.data);

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
      }) as { total_seats: number, seats: object[] }[];
      const seatAssignments = {
        total_seats: _seatAssignments[0]?.total_seats || 0,
        // octokit paginate returns an array of objects (bug)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seats: (_seatAssignments).reduce((acc, rsp) => acc.concat(rsp.seats), [] as any[])
      };

      if (!seatAssignments.seats) {
        logger.info(`No seat assignment data found.`);
        return;
      }

      SeatService.insertSeats(seatAssignments.seats);

      logger.info("Seat assignments successfully updated! 🪑");
    } catch (error) {
      logger.error('Error querying copilot seat assignments', error);
    }
  }

  public async queryTeamsAndMembers(team_slug?: string, member_login?: string) {
    if (!this.installation.account?.login) throw new Error('No installation found')
    try {
      const teams = team_slug ? [(await this.octokit.rest.teams.getByName({
        org: this.installation.account?.login,
        team_slug,
      })).data] : await this.octokit.paginate(this.octokit.rest.teams.list, {
        org: this.installation.account?.login
      });

      // First pass: Create all teams without parent relationships 🏗️
      for (const team of teams) {
        await Team.upsert({
          id: team.id,
          node_id: team.node_id,
          name: team.name,
          slug: team.slug,
          description: team.description,
          privacy: team.privacy || 'unknown',
          notification_setting: team.notification_setting || 'unknown',
          permission: team.permission,
          url: team.url,
          html_url: team.html_url,
          members_url: team.members_url,
          repositories_url: team.repositories_url
        });
      }

      // Second pass: Update parent relationships 👨‍👦
      for (const team of teams) {
        if (team.parent?.id) {
          await Team.update(
            { parent_id: team.parent.id },
            { where: { id: team.id } }
          );
        }
      }

      // Third pass: Add team members 👥
      for (const team of teams) {
        const members = await this.octokit.paginate(this.octokit.rest.teams.listMembersInOrg, {
          org: this.installation.account?.login,
          team_slug: team.slug
        });

        if (members?.length) {
          await Promise.all(members.map(async member => {
            const [dbMember] = await Member.upsert({
              id: member.id,
              login: member.login,
              node_id: member.node_id,
              avatar_url: member.avatar_url,
              gravatar_id: member.gravatar_id || null,
              url: member.url,
              html_url: member.html_url,
              followers_url: member.followers_url,
              following_url: member.following_url,
              gists_url: member.gists_url,
              starred_url: member.starred_url,
              subscriptions_url: member.subscriptions_url,
              organizations_url: member.organizations_url,
              repos_url: member.repos_url,
              events_url: member.events_url,
              received_events_url: member.received_events_url,
              type: member.type,
              site_admin: member.site_admin
            });

            // Create team-member association 🤝
            await TeamMemberAssociation.upsert({
              TeamId: team.id,
              MemberId: dbMember.id
            });
          }));
        }

        logger.info(`Team ${team.name} successfully updated! ✏️`);
      }

      if (!team_slug) {
        await Team.upsert({
          name: 'No Team',
          slug: 'no-team',
          description: 'No team assigned',
          id: -1
        });
  
        const members = member_login ? [(await this.octokit.rest.orgs.getMembershipForUser({
          org: this.installation.account?.login,
          username: member_login
        })).data.user] : await this.octokit.paginate(this.octokit.rest.orgs.listMembers, {
          org: this.installation.account?.login
        });
        if (members?.length) {
          await Promise.all(members.map(async member => {
            if (!member) return;
            const [dbMember] = await Member.upsert({
              id: member.id,
              login: member.login,
              node_id: member.node_id,
              avatar_url: member.avatar_url,
              gravatar_id: member.gravatar_id || null,
              url: member.url,
              html_url: member.html_url,
              followers_url: member.followers_url,
              following_url: member.following_url,
              gists_url: member.gists_url,
              starred_url: member.starred_url,
              subscriptions_url: member.subscriptions_url,
              organizations_url: member.organizations_url,
              repos_url: member.repos_url,
              events_url: member.events_url,
              received_events_url: member.received_events_url,
              type: member.type,
              site_admin: member.site_admin
            });
  
            // Create team-member association 🤝
            await TeamMemberAssociation.upsert({
              TeamId: -1,
              MemberId: dbMember.id
            });
          }));
        }
      }

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

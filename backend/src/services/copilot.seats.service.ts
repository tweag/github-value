import { Endpoints } from '@octokit/types';
import { Assignee, AssigningTeam, Seat } from "../models/copilot.seats.model.js";
import { Op, Sequelize } from 'sequelize';

type _Seat = NonNullable<Endpoints["GET /orgs/{org}/copilot/billing/seats"]["response"]["data"]["seats"]>[0];
export interface SeatEntry extends _Seat {
  plan_type: string;
}

type AssigneeDailyActivity = {
  [date: string]: {
    totalSeats: number,
    totalActive: number,
    totalInactive: number,
    active: {
      [assignee: string]: Date
    },
    inactive: {
      [assignee: string]: Date
    }
  };
};

class SeatsService {
  async getAllSeats() {
    return Seat.findAll({
      attributes: {
        exclude: ['id', 'assignee_id', 'assigning_team_id']
      },
      include: [{
        model: Assignee,
        as: 'assignee',
        attributes: ['login', 'id', 'avatar_url']
      }],
      where: {
        id: {
          [Op.in]: Sequelize.literal(`(
              SELECT MAX(id)
              FROM Seats
              GROUP BY assignee_id
          )`)
        }
      },
      order: [['last_activity_at', 'DESC']]
    });
  }

  async insertSeats(data: SeatEntry[]) {
    for (const seat of data) {
      const assignee = await Assignee.findOrCreate({
        where: { id: seat.assignee.id },
        defaults: {
          login: seat.assignee.login,
          node_id: seat.assignee.node_id,
          avatar_url: seat.assignee.avatar_url,
          gravatar_id: seat.assignee.gravatar_id,
          url: seat.assignee.url,
          html_url: seat.assignee.html_url,
          followers_url: seat.assignee.followers_url,
          following_url: seat.assignee.following_url,
          gists_url: seat.assignee.gists_url,
          starred_url: seat.assignee.starred_url,
          subscriptions_url: seat.assignee.subscriptions_url,
          organizations_url: seat.assignee.organizations_url,
          repos_url: seat.assignee.repos_url,
          events_url: seat.assignee.events_url,
          received_events_url: seat.assignee.received_events_url,
          type: seat.assignee.type,
          site_admin: seat.assignee.site_admin,
        }
      });

      const assigningTeam = seat.assigning_team ? await AssigningTeam.findOrCreate({
        where: { id: seat.assigning_team.id },
        defaults: {
          node_id: seat.assigning_team.node_id,
          url: seat.assigning_team.url,
          html_url: seat.assigning_team.html_url,
          name: seat.assigning_team.name,
          slug: seat.assigning_team.slug,
          description: seat.assigning_team.description,
          privacy: seat.assigning_team.privacy,
          notification_setting: seat.assigning_team.notification_setting,
          permission: seat.assigning_team.permission,
          members_url: seat.assigning_team.members_url,
          repositories_url: seat.assigning_team.repositories_url,
          parent: seat.assigning_team.parent,
        }
      }) : null;

      await Seat.create({
        created_at: seat.created_at,
        updated_at: seat.updated_at,
        pending_cancellation_date: seat.pending_cancellation_date,
        last_activity_at: seat.last_activity_at,
        last_activity_editor: seat.last_activity_editor,
        plan_type: seat.plan_type,
        assignee_id: assignee[0].id,
        assigning_team_id: assigningTeam?.[0].id
      });
    }
  }

  async getAssigneesActivity(daysInactive: number, precision: 'hour' | 'day' = 'day'): Promise<AssigneeDailyActivity> {
    const assignees = await Assignee.findAll({
      attributes: ['login', 'id'],
      include: [
        {
          model: Seat,
          as: 'activity',
          required: false,
          attributes: ['createdAt', 'last_activity_at'],
          order: [['last_activity_at', 'ASC']],
        }
      ],
      order: [
        [{ model: Seat, as: 'activity' }, 'last_activity_at', 'ASC']
      ]
    });
    const activityDays: AssigneeDailyActivity = {};
    assignees.forEach((assignee) => {
      assignee.activity.forEach((activity) => {
        const fromTime = activity.last_activity_at?.getTime() || 0;
        const toTime = activity.createdAt.getTime();
        const diff = Math.floor((toTime - fromTime) / 86400000);
        const dateIndex = new Date(activity.createdAt);
        if (precision === 'day') {
          dateIndex.setUTCHours(0, 0, 0, 0);
        } else if (precision === 'hour') {
          dateIndex.setUTCMinutes(0, 0, 0);
        }
        const dateIndexStr = new Date(dateIndex).toISOString();
        if (!activityDays[dateIndexStr]) {
          activityDays[dateIndexStr] = {
            totalSeats: 0,
            totalActive: 0,
            totalInactive: 0,
            active: {},
            inactive: {}
          }
        }
        if (activityDays[dateIndexStr].active[assignee.login] || activityDays[dateIndexStr].inactive[assignee.login]) {
          return; // already processed for this day
        }
        if (diff > daysInactive) {
          activityDays[dateIndexStr].inactive[assignee.login] = assignee.activity[0].last_activity_at;
        } else {
          activityDays[dateIndexStr].active[assignee.login] = assignee.activity[0].last_activity_at;
        }
      });
    });
    Object.entries(activityDays).forEach(([date, activity]) => {
      activityDays[date].totalSeats = Object.values(activity.active).length + Object.values(activity.inactive).length
      activityDays[date].totalActive = Object.values(activity.active).length
      activityDays[date].totalInactive = Object.values(activity.inactive).length
    });    

    const sortedActivityDays = Object.fromEntries(
      Object.entries(activityDays)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    );
    
    return sortedActivityDays;
  }
}

export default new SeatsService();
export {
  AssigneeDailyActivity
}
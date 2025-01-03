import { Endpoints } from '@octokit/types';
import { Seat } from "../models/copilot.seats.model.js";
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { components } from "@octokit/openapi-types";
import { Member, Team } from '../models/teams.model.js';
import app from '../index.js';
import mongoose from 'mongoose';

type _Seat = NonNullable<Endpoints["GET /orgs/{org}/copilot/billing/seats"]["response"]["data"]["seats"]>[0];
export interface SeatEntry extends _Seat {
  plan_type: string;
  assignee: components['schemas']['simple-user'];
}

type MemberDailyActivity = {
  [date: string]: {
    totalSeats: number,
    totalActive: number,
    totalInactive: number,
    active: {
      [assignee: string]: Seat
    },
    inactive: {
      [assignee: string]: Seat
    }
  };
};

class SeatsService {
  async getAllSeats(org?: string) {
    const Seats = mongoose.model('Seats');
    const Member = mongoose.model('Member');

    const latestQuery = await Seats.findOne()
      .sort({ queryAt: -1 })  // -1 for descending order
      .select('queryAt');

    const seats = await Seats.find({
      ...(org ? { org } : {}),
      queryAt: latestQuery?.queryAt
    }, '-_id -__v')
      .lean()
      .populate({
        path: 'assignee',  // Link to Member model 👤
        model: Member,
        select: 'login id avatar_url -_id'  // Only select needed fields 🎯
      })
      .sort({ last_activity_at: -1 });  // DESC ordering ⬇️
    return seats;
  }

  async getAssignee(id: number) {
    const Seats = mongoose.model('Seats');
    const Member = mongoose.model('Member');

    return Seats.find({
      assignee_id: id
    })
      .lean()
      .populate({
        path: 'assignee',  // Link to Member model 👤
        model: Member,
        select: 'login id avatar_url -_id'  // Only select needed fields 🎯
      });
  }

  async getAssigneeByLogin(login: string) {
    const Seats = mongoose.model('Seats');
    const Member = mongoose.model('Member');

    const assignee = await Member.findOne({
      login
    })
    if (!assignee) throw new Error(`Assignee ${login} not found`);
    return Seats.find({
      assignee_id: assignee.id
    })
      .lean()
      .populate({
        path: 'assignee',  // Link to Member model 👤
        model: Member,
        select: 'login id avatar_url -_id'  // Only select needed fields 🎯
      });
  }

  async insertSeats(org: string, data: SeatEntry[], team?: string) {
    const queryAt = new Date();
    const Members = mongoose.model('Member');
    const Seats = mongoose.model('Seats');
    for (const seat of data) {

      const member = await Members.findOneAndUpdate(
        { org, id: seat.assignee.id },
        {
          ...team ? { team } : undefined,
          org,
          id: seat.assignee.id,
          login: seat.assignee.login,
          node_id: seat.assignee.node_id,
          avatar_url: seat.assignee.avatar_url,
          gravatar_id: seat.assignee.gravatar_id || '',
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
        },
        { upsert: false }
      );

      // const [assigningTeam] = seat.assigning_team ? await Team.findOrCreate({
      //   where: { id: seat.assigning_team.id },
      //   defaults: {
      //     org,
      //     id: seat.assigning_team.id,
      //     node_id: seat.assigning_team.node_id,
      //     url: seat.assigning_team.url,
      //     html_url: seat.assigning_team.html_url,
      //     name: seat.assigning_team.name,
      //     slug: seat.assigning_team.slug,
      //     description: seat.assigning_team.description,
      //     privacy: seat.assigning_team.privacy,
      //     notification_setting: seat.assigning_team.notification_setting,
      //     permission: seat.assigning_team.permission,
      //     members_url: seat.assigning_team.members_url,
      //     repositories_url: seat.assigning_team.repositories_url
      //   }
      // }) : [null];

      await Seats.create({
        queryAt,
        org,
        team,
        created_at: seat.created_at,
        updated_at: seat.updated_at,
        pending_cancellation_date: seat.pending_cancellation_date,
        last_activity_at: seat.last_activity_at,
        last_activity_editor: seat.last_activity_editor,
        plan_type: seat.plan_type,
        assignee_id: seat.assignee.id,
        assignee: member._id,
        // assigning_team_id: assigningTeam?.id
      });

      // await Seat.create({
      //   queryAt,
      //   org,
      //   team,
      //   created_at: seat.created_at,
      //   updated_at: seat.updated_at,
      //   pending_cancellation_date: seat.pending_cancellation_date,
      //   last_activity_at: seat.last_activity_at,
      //   last_activity_editor: seat.last_activity_editor,
      //   plan_type: seat.plan_type,
      //   assignee_id: assignee.id,
      //   assigning_team_id: assigningTeam?.id
      // });
    }
  }

  async getMembersActivity(params: {
    org?: string;
    daysInactive?: number;
    precision?: 'hour' | 'day' | 'minute';
    since?: string;
    until?: string;
  } = {}): Promise<MemberDailyActivity> {
    const Seats = mongoose.model('Seats');
    // const Member = mongoose.model('Member');
    const { org, daysInactive = 30, precision = 'day', since, until } = params;
    const assignees = await Seats.aggregate([
      {
        $match: {
          ...(org && { org }),
          ...(since && { createdAt: { $gte: new Date(since) } }),
          ...(until && { createdAt: { $lte: new Date(until) } })
        }
      },
      {
        $lookup: {
          from: 'members',
          localField: 'assignee',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      {
        $unwind: '$memberDetails'
      },
      {
        $group: {
          _id: '$memberDetails._id',
          login: { $first: '$memberDetails.login' },
          id: { $first: '$memberDetails.id' },
          activity: {
            $push: {
              last_activity_at: '$last_activity_at',
              createdAt: '$createdAt',
              last_activity_editor: '$last_activity_editor'
            }
          }
        }
      }
    ]);

    const activityDays: MemberDailyActivity = {};
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
        } else if (precision === 'minute') {
          dateIndex.setUTCSeconds(0, 0);
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
          activityDays[dateIndexStr].inactive[assignee.login] = assignee.activity[0];
        } else {
          activityDays[dateIndexStr].active[assignee.login] = assignee.activity[0];
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

  async getMembersActivityTotals(params: {
    org?: string;
    since?: string;
    until?: string;
  }) {
    // const assignees2 = await app.database.sequelize?.query(`
    //   SELECT \`Member\`.\`login\`, \`Member\`.\`id\`, \`activity\`.\`id\` AS \`activity.id\`, \`activity\`.\`last_activity_at\` AS \`activity.last_activity_at\`
    //   FROM \`Members\` AS \`Member\`
    //   INNER JOIN \`Seats\` AS \`activity\` ON \`Member\`.\`id\` = \`activity\`.\`assignee_id\`
    // `, {
    //   replacements: { org },
    //   type: QueryTypes.SELECT
    // });
    const { org, since, until } = params;
    const dateFilter = {
      ...(since && { [Op.gte]: new Date(since as string) }),
      ...(until && { [Op.lte]: new Date(until as string) })
    };
    const Seats = mongoose.model('Seats');
    const Member = mongoose.model('Member');

    const assignees = await Member.find()
      .select('login id')  // 🎯 Select specific fields
      .populate({
        path: 'activity',
        match: {
          ...(org && { org }),
          ...(since && { createdAt: { $gte: new Date(since) } }),
          ...(until && { createdAt: { $lte: new Date(until) } })
        },
        options: {
          sort: { last_activity_at: 0 }  // ⬆️ ASC sorting
        },
        select: 'last_activity_at'  // 📊 Only get needed fields
      })

    const activityTotals = assignees.reduce((totals, assignee) => {
      totals[assignee.login] = assignee.activity.reduce((totalMs, activity, index) => {
        if (index === 0) return totalMs;
        const prev = assignee.activity[index - 1];
        const diff = activity.last_activity_at?.getTime() - prev.last_activity_at?.getTime();
        if (diff) {
          if (diff > 1000 * 60 * 30) {
            totalMs += 1000 * 60 * 30;
          } else {
            totalMs += diff;
          }
        }
        return totalMs;
      }, 0);
      return totals;
    }, {} as { [assignee: string]: number });

    return Object.entries(activityTotals).sort((a, b) => b[1] - a[1]);
  }
}

export default new SeatsService();

export {
  MemberDailyActivity
}
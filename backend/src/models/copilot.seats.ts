import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';
import { Endpoints } from '@octokit/types';

export type seatEntry = NonNullable<Endpoints["GET /orgs/{org}/copilot/billing/seats"]["response"]["data"]["seats"]>[0];

class Seat extends Model {
  public created_at!: Date;
  public updated_at!: Date;
  public pending_cancellation_date!: Date | null;
  public last_activity_at!: Date;
  public last_activity_editor!: string;
  public plan_type!: string;
  public assignee_id!: number;
  public assigning_team_id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

class Assignee extends Model {
  public login!: string;
  public id!: number;
  public node_id!: string;
  public avatar_url!: string;
  public gravatar_id!: string;
  public url!: string;
  public html_url!: string;
  public followers_url!: string;
  public following_url!: string;
  public gists_url!: string;
  public starred_url!: string;
  public subscriptions_url!: string;
  public organizations_url!: string;
  public repos_url!: string;
  public events_url!: string;
  public received_events_url!: string;
  public type!: string;
  public site_admin!: boolean;
  public activity!: Seat[];
}

class AssigningTeam extends Model {
  public id!: number;
  public node_id!: string;
  public url!: string;
  public html_url!: string;
  public name!: string;
  public slug!: string;
  public description!: string;
  public privacy!: string;
  public notification_setting!: string;
  public permission!: string;
  public members_url!: string;
  public repositories_url!: string;
  public parent!: string | null;
}

Seat.init({
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
  pending_cancellation_date: DataTypes.DATE,
  last_activity_at: DataTypes.DATE,
  last_activity_editor: DataTypes.STRING,
  plan_type: DataTypes.STRING,
  assignee_id: {
    type: DataTypes.INTEGER,
  },
  assigning_team_id: {
    type: DataTypes.INTEGER,
  }
}, {
  sequelize,
  timestamps: true
});

Assignee.init({
  login: DataTypes.STRING,
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  node_id: DataTypes.STRING,
  avatar_url: DataTypes.STRING,
  gravatar_id: DataTypes.STRING,
  url: DataTypes.STRING,
  html_url: DataTypes.STRING,
  followers_url: DataTypes.STRING,
  following_url: DataTypes.STRING,
  gists_url: DataTypes.STRING,
  starred_url: DataTypes.STRING,
  subscriptions_url: DataTypes.STRING,
  organizations_url: DataTypes.STRING,
  repos_url: DataTypes.STRING,
  events_url: DataTypes.STRING,
  received_events_url: DataTypes.STRING,
  type: DataTypes.STRING,
  site_admin: DataTypes.BOOLEAN
}, {
  sequelize,
  timestamps: false
});

AssigningTeam.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  node_id: DataTypes.STRING,
  url: DataTypes.STRING,
  html_url: DataTypes.STRING,
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  description: DataTypes.STRING,
  privacy: DataTypes.STRING,
  notification_setting: DataTypes.STRING,
  permission: DataTypes.STRING,
  members_url: DataTypes.STRING,
  repositories_url: DataTypes.STRING,
  parent: DataTypes.STRING
}, {
  sequelize,
  timestamps: false
});

Seat.belongsTo(Assignee, { 
  as: 'assignee', 
  foreignKey: 'assignee_id' 
});
Seat.belongsTo(AssigningTeam, { 
  as: 'assigning_team', 
  foreignKey: 'assigning_team_id' 
});
Assignee.hasMany(Seat, { 
  as: 'activity',
  foreignKey: 'assignee_id' 
});
AssigningTeam.hasMany(Seat, { 
  as: 'activity',
  foreignKey: 'assigning_team_id' 
});

async function insertSeats(data: seatEntry[]) {
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
      plan_type: (seat as any).plan_type,
      assignee_id: assignee[0].id,
      assigning_team_id: assigningTeam?.[0].id
    });
  }
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
const getAssigneesActivity = async (daysInactive: number): Promise<AssigneeDailyActivity> => {
  const assignees = await Assignee.findAll({
    attributes: ['login', 'id'],
    order: [
      ['login', 'ASC'],
      [{ model: Seat, as: 'activity' }, 'createdAt', 'DESC']
    ],
    include: [
      {
        model: Seat,
        as: 'activity',
        required: false,
        attributes: ['createdAt', 'last_activity_at']
      }
    ]
  });
  const activityDays: AssigneeDailyActivity = {};
  assignees.forEach((assignee) => {
    assignee.activity.forEach((activity) => {
      const fromTime = activity.last_activity_at?.getTime() || 0;
      const toTime = activity.createdAt.getTime();
      const diff = Math.floor((toTime - fromTime) / 86400000);
      const dateIndex = activity.createdAt.toISOString().slice(0, 10);
      if (!activityDays[dateIndex]) {
        activityDays[dateIndex] = {
          totalSeats: 0,
          totalActive: 0,
          totalInactive: 0,
          active: {},
          inactive: {}
        }
      }
      if (activityDays[dateIndex].active[assignee.login] || activityDays[dateIndex].inactive[assignee.login]) {
        return; // already processed for this day
      }
      if (diff > daysInactive) {
        activityDays[dateIndex].inactive[assignee.login] = assignee.activity[0].last_activity_at;
      } else {
        activityDays[dateIndex].active[assignee.login] = assignee.activity[0].last_activity_at;
      }
    });
  });
  Object.entries(activityDays).forEach(([date, activity]) => {
    activityDays[date].totalSeats = Object.values(activity.active).length + Object.values(activity.inactive).length
    activityDays[date].totalActive = Object.values(activity.active).length
    activityDays[date].totalInactive = Object.values(activity.inactive).length
  });
  return activityDays;
}

export { Seat, Assignee, AssigningTeam, insertSeats, getAssigneesActivity };
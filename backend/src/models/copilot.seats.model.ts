import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';
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

export { Seat, Assignee, AssigningTeam };
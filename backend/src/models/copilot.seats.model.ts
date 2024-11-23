import { Model, DataTypes, Sequelize, CreationOptional } from 'sequelize';
import { components } from '@octokit/openapi-types';

type SeatType = {
  created_at: string | null;
  updated_at: string | null;
  pending_cancellation_date: string | null;
  last_activity_at: string | null;
  last_activity_editor: string | null;
  plan_type: string;
  assignee_id: number;
  assigning_team_id: number | null;
};

class Seat extends Model<SeatType> {
  declare created_at: Date;
  declare updated_at: Date;
  declare pending_cancellation_date: Date | null;
  declare last_activity_at: Date;
  declare last_activity_editor: string;
  declare plan_type: string;
  declare assignee_id: number;
  declare assigning_team_id: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
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
    Assignee.initModel(sequelize);
    AssigningTeam.initModel(sequelize);
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
  }
}

type AssigneeType = {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

class Assignee extends Model<AssigneeType> {
  declare id: number;
  declare login: string;
  declare node_id: string;
  declare avatar_url: string;
  declare gravatar_id: string;
  declare url: string;
  declare html_url: string;
  declare followers_url: string;
  declare following_url: string;
  declare gists_url: string;
  declare starred_url: string;
  declare subscriptions_url: string;
  declare organizations_url: string;
  declare repos_url: string;
  declare events_url: string;
  declare received_events_url: string;
  declare type: string;
  declare site_admin: boolean;
  declare activity: Seat[];

  static initModel(sequelize: Sequelize) {
    Assignee.init({
      login: DataTypes.STRING,
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
  }
}

class AssigningTeam extends Model<NonNullable<components["schemas"]["team"]>> {
  declare id: number;
  declare node_id: string;
  declare url: string;
  declare html_url: string;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare privacy: string;
  declare notification_setting: string;
  declare permission: string;
  declare members_url: string;
  declare repositories_url: string;
  declare parent: string | null;

  static initModel(sequelize: Sequelize) {
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
  }
}

export { Seat, Assignee, AssigningTeam };
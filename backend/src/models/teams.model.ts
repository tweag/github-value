import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

class Team extends Model {
  public id!: number;
  public node_id!: string;
  public name!: string;
  public slug!: string;
  public description!: string | null;
  public privacy!: string;
  public notification_setting!: string;
  public permission!: string;
  public url!: string;
  public html_url!: string;
  public members_url!: string;
  public repositories_url!: string;
  public updatedAt!: Date;
  public createdAt!: Date;
}

class Member extends Model {
  public login!: string;
  public id!: number;
  public node_id!: string;
  public avatar_url!: string;
  public gravatar_id!: string | null;
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
  public name!: string | null;
  public email!: string | null;
  public starred_at?: string;
  public user_view_type?: string;
}

class TeamMemberAssociation extends Model {
  public TeamId!: number;
  public MemberId!: number;
}

Team.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  node_id: DataTypes.STRING,
  name: DataTypes.STRING,
  slug: DataTypes.STRING,
  description: DataTypes.STRING,
  privacy: DataTypes.STRING,
  notification_setting: DataTypes.STRING,
  permission: DataTypes.STRING,
  url: DataTypes.STRING,
  html_url: DataTypes.STRING,
  members_url: DataTypes.STRING,
  repositories_url: DataTypes.STRING,
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize
});

Member.init({
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
  site_admin: DataTypes.BOOLEAN,
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  starred_at: DataTypes.STRING,
  user_view_type: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize
});

TeamMemberAssociation.init({
  TeamId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Team,
      key: 'id'
    }
  },
  MemberId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Member,
      key: 'id'
    }
  }
}, {
  sequelize,
  timestamps: false
});

Team.belongsToMany(Member, { 
  through: TeamMemberAssociation,
  foreignKey: 'TeamId',
  otherKey: 'MemberId',
  as: 'members'
});
Member.belongsToMany(Team, { 
  through: TeamMemberAssociation,
  foreignKey: 'MemberId',
  otherKey: 'TeamId',
  as: 'teams'
});
Team.belongsTo(Team, { as: 'parent', foreignKey: 'parent_id' });
Team.hasMany(Team, { as: 'children', foreignKey: 'parent_id' });

const deleteTeam = async (teamId: number) => {
  const team = await Team.findByPk(teamId);
  if (!team) {
    throw new Error(`Team with ID ${teamId} not found`);
  }

  await TeamMemberAssociation.destroy({
    where: {
      TeamId: teamId
    }
  });

  await Team.update(
    { parent_id: null },
    { 
      where: { 
        parent_id: teamId 
      }
    }
  );

  await Team.destroy({
    where: {
      id: teamId
    }
  });

  return true;
}

const deleteMemberFromTeam = async (teamId: number, memberId: number) => {
  const team = await Team.findByPk(teamId);
  const member = await Member.findByPk(memberId);

  if (!team) {
    throw new Error(`Team with ID ${teamId} not found`);
  }
  if (!member) {
    throw new Error(`Member with ID ${memberId} not found`);
  }

  const deleted = await TeamMemberAssociation.destroy({
    where: {
      TeamId: teamId,
      MemberId: memberId
    }
  });

  if (deleted === 0) {
    throw new Error(`Member ${memberId} is not part of team ${teamId}`);
  }

  return true;
};

const deleteMember = async (memberId: number) => {
  const member = await Member.findByPk(memberId);
  if (!member) {
    throw new Error(`Member with ID ${memberId} not found`);
  }

  await TeamMemberAssociation.destroy({
    where: {
      MemberId: memberId
    }
  });

  await Member.destroy({
    where: {
      id: memberId
    }
  });

  return true;
};

const getLastUpdatedAt = async () => {
  const team = await Team.findOne({
    order: [
      ['updatedAt', 'ASC']
    ]
  });
  if (!team?.updatedAt) {
    return new Date(0);
  }
  return team.updatedAt;
}

export {
  deleteTeam,
  deleteMemberFromTeam,
  deleteMember,
  getLastUpdatedAt,
  Team,
  Member,
  TeamMemberAssociation
};

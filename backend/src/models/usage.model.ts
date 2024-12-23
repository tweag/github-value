import { DataTypes, Model, Sequelize } from 'sequelize';
import logger from '../services/logger.js';
import { Endpoints } from '@octokit/types';
import mongoose from 'mongoose';

type UsageType = {
  org: string;
  team?: string;
  day: string;
  totalSuggestionsCount: number;
  totalAcceptancesCount: number;
  totalLinesSuggested: number;
  totalLinesAccepted: number;
  totalActiveUsers: number;
  totalChatAcceptances: number;
  totalChatTurns: number;
  totalActiveChatUsers: number;
}

type UsageBreakdownType = {
  id?: number;
  usage_day: string;
  language: string;
  editor: string;
  suggestionsCount: number;
  acceptancesCount: number;
  linesSuggested: number;
  linesAccepted: number;
  activeUsers: number;
}

class Usage extends Model<UsageType> {
  declare org: string;
  declare team: string;
  declare day: string;
  declare totalSuggestionsCount: number;
  declare totalAcceptancesCount: number;
  declare totalLinesSuggested: number;
  declare totalLinesAccepted: number;
  declare totalActiveUsers: number;
  declare totalChatAcceptances: number;
  declare totalChatTurns: number;
  declare totalActiveChatUsers: number;

  static initModel(sequelize: Sequelize) {
    // UsageBreakdown.initModel(sequelize);
  }
}

class UsageBreakdown extends Model<UsageBreakdownType> {
  declare id: number;
  declare usage_day: string;
  declare language: string;
  declare editor: string;
  declare suggestionsCount: number;
  declare acceptancesCount: number;
  declare linesSuggested: number;
  declare linesAccepted: number;
  declare activeUsers: number;

  static initModel(sequelize: Sequelize) {
    UsageBreakdown.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usage_day: {
        type: DataTypes.DATEONLY,
        references: {
          model: Usage,
          key: 'day',
        },
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      editor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      suggestionsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      acceptancesCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      linesSuggested: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      linesAccepted: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activeUsers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      sequelize,
      modelName: 'UsageBreakdown',
      timestamps: false,
    });

    // Set up associations
    Usage.hasMany(UsageBreakdown, { foreignKey: 'usage_day' });
    UsageBreakdown.belongsTo(Usage, { foreignKey: 'usage_day' });
  }
}

async function insertUsage(org: string, data: Endpoints["GET /orgs/{org}/copilot/usage"]["response"]["data"], team?: string) {
  for (const metrics of data) {
    const Usage = mongoose.model('Usage');
    
    await Usage.findOneAndUpdate(
      { day: metrics.day },
      { ...metrics },
      { upsert: true }
    );
  }
}

export { Usage, UsageBreakdown, insertUsage };
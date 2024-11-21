import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

type SurveyType = {
  id?: number;
  owner: string;
  repo: string;
  prNumber: number;
  status: 'pending' | 'completed';
  hits: number;
  userId: string;
  usedCopilot: boolean;
  percentTimeSaved: number;
  timeUsedFor: string;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Survey extends Model<SurveyType> {
  declare id?: number;
  declare owner: string;
  declare repo: string;
  declare prNumber: number;
  declare status: 'pending' | 'completed';
  declare hits: number;
  declare userId: string;
  declare usedCopilot: boolean;
  declare percentTimeSaved: number;
  declare timeUsedFor: string;
  declare reason: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

Survey.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hits: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  usedCopilot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  percentTimeSaved: {
    type: DataTypes.INTEGER,
    allowNull: false,
    set(value: number) {
      this.setDataValue('percentTimeSaved', !this.usedCopilot ? 0 : value);
    }
  },
  reason: {
    type: DataTypes.STRING(4096),
    allowNull: true,
  },
  timeUsedFor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  repo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  sequelize,
  modelName: 'Survey',
  timestamps: true,
});

export { Survey, SurveyType };
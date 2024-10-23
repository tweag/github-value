import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class Survey extends Model {
  public id!: number;
  public dateTime!: Date;
  public userId!: number;
  public usedCopilot!: boolean;
  public percentTimeSaved!: number;
  public timeUsedFor!: string;
}

Survey.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usedCopilot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  percentTimeSaved: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timeUsedFor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
}, {
  sequelize,
  modelName: 'Survey',
});

export default Survey;
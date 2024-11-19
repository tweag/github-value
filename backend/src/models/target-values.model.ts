import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

class TargetValues extends Model {
  public targetedRoomForImprovement!: number;
  public targetedNumberOfDevelopers!: number;
  public targetedPercentOfTimeSaved!: number;
}

TargetValues.init({
  targetedRoomForImprovement: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  targetedNumberOfDevelopers: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetedPercentOfTimeSaved: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'TargetValues',
  timestamps: false,
});

export { TargetValues };

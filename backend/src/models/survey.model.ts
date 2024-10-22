import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class Survey extends Model {
  public id!: number;
  public daytime!: Date;
  public userId!: number;
  public usedCopilot!: boolean;
  public pctTimesaved!: number;
  public timeUsedFor!: string;

  // Virtual field for time saved
  public get timeSaved(): string {
    return `${this.pctTimesaved}% saved for ${this.timeUsedFor}`;
  }

  public set timeSaved(value: string) {
    const [pct, ...rest] = value.split(' ');
    this.pctTimesaved = parseInt(pct.replace('%', ''), 10);
    this.timeUsedFor = rest.join(' ').replace('saved for ', '');
  }
}

Survey.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  daytime: {
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
  pctTimesaved: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timeUsedFor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timeSaved: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.getDataValue('pctTimesaved')}% saved for ${this.getDataValue('timeUsedFor')}`;
    },
    set(value: string) {
      const [pct, ...rest] = value.split(' ');
      this.setDataValue('pctTimesaved', parseInt(pct.replace('%', ''), 10));
      this.setDataValue('timeUsedFor', rest.join(' ').replace('saved for ', ''));
    },
  },
}, {
  sequelize,
  modelName: 'Survey',
});

export default Survey;
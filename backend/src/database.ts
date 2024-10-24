import { Sequelize } from 'sequelize';
import { Metrics, Breakdown } from './models/metrics.model';
import { Settings } from './models/settings.model';
import { Survey } from './models/survey.model';

const sequelize = new Sequelize({
  dialect: 'mysql',
  database: process.env.MYSQL_DATABASE,
  username: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
});
const dbConnect = async () => {
  try {
    console.log('Attempting to connect to the database...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  try {
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to sync the database:', error);
  }
};

export { dbConnect, sequelize };
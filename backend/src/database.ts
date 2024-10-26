import { Sequelize } from 'sequelize';
import { Metrics, Breakdown } from './models/metrics.model';
import { Settings } from './models/settings.model';
import { Survey } from './models/survey.model';
import logger from './services/logger';

const sequelize = new Sequelize({
  dialect: 'mysql',
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  logging: (sql: string, timing?: number) => {
    logger.info(sql);
  }
});
const dbConnect = async () => {
  await sequelize.authenticate().catch((error) => {
    logger.info('Unable to authenticate to the database:', error);
  });
  await sequelize.sync().catch((error) => {
    logger.info('Unable to authenticate to the database:', error);
  });
};

export { dbConnect, sequelize };
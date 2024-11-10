import { Sequelize } from 'sequelize';
import logger from './services/logger';
import mysql2 from 'mysql2/promise';

const sequelize = process.env.JAWSDB_URL ?
  new Sequelize(process.env.JAWSDB_URL) :
  new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'octocat',
    database: process.env.MYSQL_DATABASE || 'value',
    logging: (sql: string, timing?: number) => {
      logger.info(sql);
    }
  });

const dbConnect = async () => {
  try {
    if (process.env.JAWSDB_URL) {
      const connection = await mysql2.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'octocat',
      });
  
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`value\`;`,);
  
      await connection.end();
    }
  } catch (error) {
    logger.error('Unable to connect to the database', error);
    throw error;
  }
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: false }).then(() => {
      logger.info('All models were synchronized successfully. 🚀');
    }).catch((error) => {
      console.log(error);
      logger.error('Error synchronizing models', error);
    });
  } catch (error) {
    logger.info('Unable to initialize the database', error);
    throw error;
  }
};

export { dbConnect, sequelize };
import { Options, Sequelize } from 'sequelize';
import mysql2 from 'mysql2/promise';
import logger from './services/logger.js';

export interface DatabaseInputs {
  url: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

class Database {
  private static instance: Database;
  sequelize?: Sequelize;
  options: Options = {
    dialect: 'mysql',
    logging: (sql) => logger.debug(sql),
    timezone: '+00:00', // Force UTC timezone
    dialectOptions: {
      timezone: '+00:00' // Force UTC for MySQL connection
    }
  }

  constructor(input: DatabaseInputs) {
    this.connect(input);
  }

  public static getInstance(input: DatabaseInputs): Database {
    if (!Database.instance) {
      Database.instance = new Database(input);
    }
    return Database.instance;
  }

  async connect(input: DatabaseInputs) {
    try {
      try {
        this.sequelize = input.url ? new Sequelize(input.url, {
          pool: {
            max: 10,
            acquire: 30000,
            idle: 10000
          },
          ...this.options
        }) : new Sequelize({
          host: input.host,
          port: Number(input.port),
          username: input.username,
          password: input.password,
          database: input.database,
          ...this.options
        });
      } catch (error) {
        logger.error('Unable to connect to the database');
        throw error;
      }

      try {
        const connection = await mysql2.createConnection({
          host: process.env.MYSQL_HOST || 'localhost',
          port: parseInt(process.env.MYSQL_PORT || '3306'),
          user: process.env.MYSQL_USER || 'root',
          password: process.env.MYSQL_PASSWORD || 'octocat',
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE}\`;`,);
        await connection.end();
      } catch (error) {
        logger.error('Unable to create the database');
        throw error;
      }

      try {
        await this.sequelize.authenticate()
        await this.sequelize.sync({ alter: true }).then(() => {
          logger.info('All models were synchronized successfully. 🚀');
        }).catch((error) => {
          logger.debug(error);
          logger.error('Error synchronizing models');
        });
      } catch (error) {
        logger.info('Unable to initialize the database');
        throw error;
      }
    } catch (error) {
      logger.debug(error);
      throw error;
    }
  }

}

export default Database.getInstance;
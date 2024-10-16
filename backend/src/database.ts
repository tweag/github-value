// backend/src/database.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
});

export default sequelize;
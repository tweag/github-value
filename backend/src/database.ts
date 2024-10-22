// backend/src/database.ts
import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  database: process.env.MYSQL_DATABASE,
  username: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
});

(async () => {
  try {
    console.log('Attempting to connect to the database...'); // 🌐🔍
    await sequelize.authenticate();
    console.log('Connection has been established successfully.'); // 🎉✅
  } catch (error) {
    console.error('Unable to connect to the database:', error); // 🚨❌
  }
  try {
    await sequelize.sync(); // Recreate the database schema
  } catch (error) {
    console.error('Unable to sync the database:', error);
  }
})();

export default sequelize;
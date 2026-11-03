const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
const dialect = process.env.DB_DIALECT || (databaseUrl && databaseUrl.startsWith('mysql') ? 'mysql' : 'postgres');

if (!['postgres', 'mysql'].includes(dialect)) {
  throw new Error(`Unsupported DB_DIALECT "${dialect}". Use "postgres" or "mysql".`);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect,
  logging: false,
  dialectOptions: process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;

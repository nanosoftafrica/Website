const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const PageView = sequelize.define('PageView', {
  path:  { type: DataTypes.STRING,  defaultValue: '/' },
  date:  { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  count: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'page_views', timestamps: false });

module.exports = PageView;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Company = sequelize.define('Company', {
  name:     { type: DataTypes.STRING, allowNull: false },
  domain:   { type: DataTypes.STRING, defaultValue: '' },
  industry: { type: DataTypes.STRING, defaultValue: '' },
  size:     { type: DataTypes.STRING, defaultValue: '' },
  phone:    { type: DataTypes.STRING, defaultValue: '' },
  address:  { type: DataTypes.STRING, defaultValue: '' },
  website:  { type: DataTypes.STRING, defaultValue: '' },
  notes:    { type: DataTypes.TEXT,   defaultValue: '' },
}, { tableName: 'companies', timestamps: true });

module.exports = Company;

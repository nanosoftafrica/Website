const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const SystemIntegration = sequelize.define('SystemIntegration', {
  key:          { type: DataTypes.STRING, unique: true, allowNull: false },
  name:         { type: DataTypes.STRING, allowNull: false },
  isEnabled:    { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_enabled' },
  config:       { type: DataTypes.JSON, defaultValue: {} },
  lastTestedAt: { type: DataTypes.DATE, defaultValue: null, field: 'last_tested_at' },
  testStatus:   { type: DataTypes.STRING, defaultValue: 'untested', field: 'test_status' },
  testMessage:  { type: DataTypes.TEXT, defaultValue: '', field: 'test_message' },
}, { tableName: 'system_integrations', timestamps: true });

module.exports = SystemIntegration;

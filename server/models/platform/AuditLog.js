const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const AuditLog = sequelize.define('AuditLog', {
  adminUsername: { type: DataTypes.STRING, defaultValue: 'system' },
  action:        { type: DataTypes.STRING, allowNull: false },  // create | update | delete | login
  entity:        { type: DataTypes.STRING, defaultValue: '' },  // product | team | post | etc.
  entityId:      { type: DataTypes.STRING, defaultValue: null },
  summary:       { type: DataTypes.TEXT,   defaultValue: '' },
}, { tableName: 'audit_logs', timestamps: true, updatedAt: false });

module.exports = AuditLog;

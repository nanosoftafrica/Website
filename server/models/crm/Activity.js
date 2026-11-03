const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Activity = sequelize.define('Activity', {
  type:      { type: DataTypes.ENUM('note', 'whatsapp', 'call', 'email', 'meeting', 'task'), allowNull: false },
  subject:   { type: DataTypes.STRING, defaultValue: '' },
  body:      { type: DataTypes.TEXT,   defaultValue: '' },
  contactId: { type: DataTypes.INTEGER, defaultValue: null, field: 'contact_id' },
  dealId:    { type: DataTypes.INTEGER, defaultValue: null, field: 'deal_id' },
  companyId: { type: DataTypes.INTEGER, defaultValue: null, field: 'company_id' },
  dueDate:   { type: DataTypes.DATEONLY, defaultValue: null, field: 'due_date' },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdBy: { type: DataTypes.STRING, defaultValue: 'system', field: 'created_by' },
}, { tableName: 'activities', timestamps: true });

module.exports = Activity;

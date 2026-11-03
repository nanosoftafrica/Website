const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Deal = sequelize.define('Deal', {
  title:             { type: DataTypes.STRING, allowNull: false },
  value:             { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  currency:          { type: DataTypes.STRING, defaultValue: 'KES' },
  stage:             { type: DataTypes.ENUM('new', 'contacted', 'qualified', 'won', 'lost'), defaultValue: 'new' },
  contactId:         { type: DataTypes.INTEGER, allowNull: false, field: 'contact_id' },
  companyId:         { type: DataTypes.INTEGER, defaultValue: null, field: 'company_id' },
  expectedCloseDate: { type: DataTypes.DATEONLY, defaultValue: null, field: 'expected_close_date' },
  ownerUsername:     { type: DataTypes.STRING, defaultValue: '', field: 'owner_username' },
  order:             { type: DataTypes.INTEGER, defaultValue: 0 },
  notes:             { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'deals', timestamps: true });

module.exports = Deal;

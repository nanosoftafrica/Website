const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// ITIL Service Request Management: standard, pre-approved requests (installs,
// hardware sourcing, upgrades) fulfilled via a procurement/installation flow.
// Renamed from WorkOrder — same table (renamed in the ITIL migration), same
// columns, no data loss.
const ServiceRequest = sequelize.define('ServiceRequest', {
  title:        { type: DataTypes.STRING, allowNull: false },
  description:  { type: DataTypes.TEXT, defaultValue: '' },
  contactId:    { type: DataTypes.INTEGER, allowNull: false, field: 'contact_id' },
  companyId:    { type: DataTypes.INTEGER, defaultValue: null, field: 'company_id' },
  dealId:       { type: DataTypes.INTEGER, defaultValue: null, field: 'deal_id' },
  stage:        { type: DataTypes.ENUM('new', 'sourcing', 'supplier_ordered', 'delivered', 'installation', 'done', 'cancelled'), defaultValue: 'new' },
  value:        { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  expectedDate: { type: DataTypes.DATEONLY, defaultValue: null, field: 'expected_date' },
  ownerUsername: { type: DataTypes.STRING, defaultValue: '', field: 'owner_username' },
  order:        { type: DataTypes.INTEGER, defaultValue: 0 },
  notes:        { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'service_requests', timestamps: true });

module.exports = ServiceRequest;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// ITIL Incident Management: unplanned service disruptions needing
// restoration (as opposed to ServiceRequest's planned/pre-approved work).
// priority is server-derived from impact x urgency — see lib/ticketStages.ts
// derivePriority() — never set directly by the client.
const Incident = sequelize.define('Incident', {
  title:         { type: DataTypes.STRING, allowNull: false },
  description:   { type: DataTypes.TEXT, defaultValue: '' },
  contactId:     { type: DataTypes.INTEGER, allowNull: false, field: 'contact_id' },
  companyId:     { type: DataTypes.INTEGER, defaultValue: null, field: 'company_id' },
  severity:      { type: DataTypes.ENUM('critical', 'high', 'medium', 'low'), defaultValue: 'medium' },
  impact:        { type: DataTypes.ENUM('high', 'medium', 'low'), defaultValue: 'medium' },
  urgency:       { type: DataTypes.ENUM('high', 'medium', 'low'), defaultValue: 'medium' },
  priority:      { type: DataTypes.ENUM('p1', 'p2', 'p3', 'p4'), defaultValue: 'p3' },
  status:        { type: DataTypes.ENUM('new', 'in_progress', 'on_hold', 'resolved', 'closed'), defaultValue: 'new' },
  ownerUsername: { type: DataTypes.STRING, defaultValue: '', field: 'owner_username' },
  slaTargetAt:   { type: DataTypes.DATE, defaultValue: null, field: 'sla_target_at' },
  resolvedAt:    { type: DataTypes.DATE, defaultValue: null, field: 'resolved_at' },
  closedAt:      { type: DataTypes.DATE, defaultValue: null, field: 'closed_at' },
  order:         { type: DataTypes.INTEGER, defaultValue: 0 },
  notes:         { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'incidents', timestamps: true });

module.exports = Incident;

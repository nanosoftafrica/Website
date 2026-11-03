const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Assignment = sequelize.define('Assignment', {
  ticketType:    { type: DataTypes.ENUM('service_request', 'incident'), allowNull: false, field: 'ticket_type' },
  ticketId:      { type: DataTypes.INTEGER, allowNull: false, field: 'ticket_id' },
  assigneeType:  { type: DataTypes.ENUM('supplier', 'technician'), allowNull: false, field: 'assignee_type' },
  assigneeId:    { type: DataTypes.INTEGER, allowNull: false, field: 'assignee_id' },
  status:        { type: DataTypes.ENUM('assigned', 'acknowledged', 'declined', 'completed'), defaultValue: 'assigned' },
  assignedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'assigned_at' },
  acknowledgedAt: { type: DataTypes.DATE, defaultValue: null, field: 'acknowledged_at' },
  completedAt:   { type: DataTypes.DATE, defaultValue: null, field: 'completed_at' },
  notes:         { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'assignments', timestamps: true });

module.exports = Assignment;

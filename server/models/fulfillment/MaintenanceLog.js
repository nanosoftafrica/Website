const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const MaintenanceLog = sequelize.define('MaintenanceLog', {
  deviceId:                   { type: DataTypes.INTEGER, allowNull: false, field: 'device_id' },
  companyId:                  { type: DataTypes.INTEGER, allowNull: false, field: 'company_id' },
  technicianId:               { type: DataTypes.INTEGER, defaultValue: null, field: 'technician_id' },
  incidentId:                 { type: DataTypes.INTEGER, defaultValue: null, field: 'incident_id' },
  maintenanceType:            { type: DataTypes.ENUM('routine_preventive', 'repair_corrective', 'inspection', 'firmware_update', 'installation', 'decommission'), defaultValue: 'routine_preventive', field: 'maintenance_type' },
  status:                     { type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'), defaultValue: 'completed' },
  performedAt:                { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'performed_at' },
  summary:                    { type: DataTypes.STRING, allowNull: false },
  details:                    { type: DataTypes.TEXT, defaultValue: '' },
  partsReplaced:              { type: DataTypes.TEXT, defaultValue: '', field: 'parts_replaced' },
  deviceStatusAfter:          { type: DataTypes.STRING, defaultValue: 'operational', field: 'device_status_after' },
  nextRecommendedMaintenance: { type: DataTypes.DATEONLY, defaultValue: null, field: 'next_recommended_maintenance' },
  cost:                       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  notes:                      { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'maintenance_logs', timestamps: true });

module.exports = MaintenanceLog;

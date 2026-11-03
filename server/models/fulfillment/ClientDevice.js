const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const ClientDevice = sequelize.define('ClientDevice', {
  companyId:                { type: DataTypes.INTEGER, allowNull: false, field: 'company_id' },
  contactId:                { type: DataTypes.INTEGER, defaultValue: null, field: 'contact_id' },
  deviceName:               { type: DataTypes.STRING, allowNull: false, field: 'device_name' },
  deviceType:               { type: DataTypes.STRING, defaultValue: 'other', field: 'device_type' },
  brand:                    { type: DataTypes.STRING, defaultValue: '' },
  modelNumber:              { type: DataTypes.STRING, defaultValue: '', field: 'model_number' },
  serialNumber:             { type: DataTypes.STRING, defaultValue: '', field: 'serial_number' },
  assetTag:                 { type: DataTypes.STRING, defaultValue: '', field: 'asset_tag' },
  locationOnPremise:        { type: DataTypes.STRING, defaultValue: '', field: 'location_on_premise' },
  installationDate:         { type: DataTypes.DATEONLY, defaultValue: null, field: 'installation_date' },
  installedByTechnicianId:  { type: DataTypes.INTEGER, defaultValue: null, field: 'installed_by_technician_id' },
  warrantyExpiresAt:        { type: DataTypes.DATEONLY, defaultValue: null, field: 'warranty_expires_at' },
  maintenanceIntervalMonths:{ type: DataTypes.INTEGER, defaultValue: 6, field: 'maintenance_interval_months' },
  lastMaintenanceDate:      { type: DataTypes.DATEONLY, defaultValue: null, field: 'last_maintenance_date' },
  nextMaintenanceDate:      { type: DataTypes.DATEONLY, defaultValue: null, field: 'next_maintenance_date' },
  status:                   { type: DataTypes.ENUM('active', 'needs_maintenance', 'under_repair', 'decommissioned', 'spare'), defaultValue: 'active' },
  specifications:           { type: DataTypes.JSON, defaultValue: {} },
  notes:                    { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'client_devices', timestamps: true });

module.exports = ClientDevice;

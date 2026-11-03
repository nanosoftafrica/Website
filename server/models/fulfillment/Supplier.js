const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Supplier = sequelize.define('Supplier', {
  name:        { type: DataTypes.STRING, allowNull: false },
  contactName: { type: DataTypes.STRING, defaultValue: '', field: 'contact_name' },
  email:       { type: DataTypes.STRING, defaultValue: '' },
  phone:       { type: DataTypes.STRING, defaultValue: '' },
  specialty:   { type: DataTypes.STRING, defaultValue: '' },
  address:     { type: DataTypes.STRING, defaultValue: '' },
  notes:       { type: DataTypes.TEXT,   defaultValue: '' },
  active:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'suppliers', timestamps: true });

module.exports = Supplier;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Technician = sequelize.define('Technician', {
  name:      { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, defaultValue: '' },
  phone:     { type: DataTypes.STRING, defaultValue: '' },
  specialty: { type: DataTypes.STRING, defaultValue: '' },
  notes:     { type: DataTypes.TEXT,   defaultValue: '' },
  active:    { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'technicians', timestamps: true });

module.exports = Technician;

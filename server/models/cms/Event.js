const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Event = sequelize.define('Event', {
  title:       { type: DataTypes.STRING,  allowNull: false },
  subtitle:    { type: DataTypes.STRING,  defaultValue: '' },
  date:        { type: DataTypes.STRING,  defaultValue: '' },   // display string e.g. "June 2025"
  description: { type: DataTypes.TEXT,    defaultValue: '' },
  image:       { type: DataTypes.STRING,  defaultValue: null },
  type:        { type: DataTypes.STRING,  defaultValue: 'celebration' }, // celebration | milestone | award | anniversary
  active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  order:       { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'events', timestamps: true });

module.exports = Event;

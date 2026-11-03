const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Team = sequelize.define('Team', {
  name:     { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.STRING },
  initials: { type: DataTypes.STRING },
  gradient: { type: DataTypes.STRING, defaultValue: 'linear-gradient(135deg,#10b981,#0ea5e9)' },
  bio:      { type: DataTypes.TEXT, defaultValue: '' },
  order:    { type: DataTypes.INTEGER, defaultValue: 0 },
  active:   { type: DataTypes.BOOLEAN, defaultValue: true },
  photo:    { type: DataTypes.STRING, defaultValue: null }
});

module.exports = Team;

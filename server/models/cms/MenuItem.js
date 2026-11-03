const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const MenuItem = sequelize.define('MenuItem', {
  label:  { type: DataTypes.STRING,  allowNull: false },
  href:   { type: DataTypes.STRING,  allowNull: false },
  order:  { type: DataTypes.INTEGER, defaultValue: 0 },
  newTab: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'new_tab' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'menu_items', timestamps: true });

module.exports = MenuItem;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Testimonial = sequelize.define('Testimonial', {
  name:    { type: DataTypes.STRING,  allowNull: false },
  role:    { type: DataTypes.STRING,  defaultValue: '' },
  company: { type: DataTypes.STRING,  defaultValue: '' },
  quote:   { type: DataTypes.TEXT,    allowNull: false },
  rating:  { type: DataTypes.INTEGER, defaultValue: 5 },
  photo:   { type: DataTypes.STRING,  defaultValue: null },
  active:  { type: DataTypes.BOOLEAN, defaultValue: true },
  order:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'testimonials', timestamps: true });

module.exports = Testimonial;

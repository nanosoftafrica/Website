const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const CaseStudy = sequelize.define('CaseStudy', {
  title:        { type: DataTypes.STRING, allowNull: false },
  slug:         { type: DataTypes.STRING, unique: true, allowNull: false },
  client:       { type: DataTypes.STRING, allowNull: false },
  industry:     { type: DataTypes.STRING, defaultValue: '' },
  location:     { type: DataTypes.STRING, defaultValue: '' },
  summary:      { type: DataTypes.TEXT, defaultValue: '' },
  challenge:    { type: DataTypes.TEXT, defaultValue: '' },
  solution:     { type: DataTypes.TEXT, defaultValue: '' },
  outcome:      { type: DataTypes.TEXT, defaultValue: '' },
  servicesUsed: { type: DataTypes.JSON, defaultValue: [], field: 'services_used' },
  heroImage:    { type: DataTypes.STRING, defaultValue: null, field: 'hero_image' },
  color:        { type: DataTypes.STRING, defaultValue: '#0096D6' },
  bgColor:      { type: DataTypes.STRING, defaultValue: 'rgba(0,150,214,0.08)', field: 'bg_color' },
  order:        { type: DataTypes.INTEGER, defaultValue: 0 },
  active:       { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'case_studies', timestamps: true });

module.exports = CaseStudy;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Content = sequelize.define('Content', {
  hero:         { type: DataTypes.JSON, defaultValue: {} },
  company:      { type: DataTypes.JSON, defaultValue: {} },
  services:     { type: DataTypes.JSON, defaultValue: [] },
  clients:      { type: DataTypes.JSON, defaultValue: [] },
  processSteps: { type: DataTypes.JSON, defaultValue: [], field: 'process_steps' },
  seo:          { type: DataTypes.JSON, defaultValue: {} },
  sections:     { type: DataTypes.JSON, defaultValue: {} }
});

Content.getSingleton = async function () {
  let doc = await Content.findOne();
  if (!doc) doc = await Content.create({});
  return doc;
};

module.exports = Content;

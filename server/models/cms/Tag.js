const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Tag = sequelize.define('Tag', {
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { tableName: 'tags', timestamps: true });

module.exports = Tag;

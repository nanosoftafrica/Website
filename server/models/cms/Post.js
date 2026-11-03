const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Post = sequelize.define('Post', {
  title:       { type: DataTypes.STRING,  allowNull: false },
  slug:        { type: DataTypes.STRING,  allowNull: false, unique: true },
  excerpt:     { type: DataTypes.TEXT,    defaultValue: '' },
  body:        { type: DataTypes.TEXT,    defaultValue: '' },  // HTML from Quill
  coverImage:  { type: DataTypes.STRING,  defaultValue: null },
  author:      { type: DataTypes.STRING,  defaultValue: 'Nanosoft Technologies' },
  tags:        { type: DataTypes.JSON,    defaultValue: [] },
  status:      { type: DataTypes.STRING,  defaultValue: 'draft' }, // draft | published
  publishedAt: { type: DataTypes.DATE,    defaultValue: null },
  order:       { type: DataTypes.INTEGER, defaultValue: 0 },
  // Unpublished edits to a published item; the live fields stay as they are until published.
  draftData:   { type: DataTypes.JSON,    defaultValue: null, field: 'draft_data' },
}, { tableName: 'posts', timestamps: true });

module.exports = Post;

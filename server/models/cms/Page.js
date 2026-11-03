const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Page = sequelize.define('Page', {
  title:          { type: DataTypes.STRING,  allowNull: false },
  slug:           { type: DataTypes.STRING,  allowNull: false, unique: true },
  status:         { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
  blocks:         { type: DataTypes.JSON,    defaultValue: [] },
  seoTitle:       { type: DataTypes.STRING,  defaultValue: '', field: 'seo_title' },
  seoDescription: { type: DataTypes.STRING,  defaultValue: '', field: 'seo_description' },
  ogImage:        { type: DataTypes.STRING,  defaultValue: null, field: 'og_image' },
  // Unpublished edits to a published item; the live fields stay as they are until published.
  draftData:   { type: DataTypes.JSON,    defaultValue: null, field: 'draft_data' },
}, { tableName: 'pages', timestamps: true });

module.exports = Page;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// Plain join table — postId/tagId are queried manually (no Sequelize
// associations used anywhere in this codebase, see Product/ProductCategory).
const PostTag = sequelize.define('PostTag', {
  postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  tagId:  { type: DataTypes.INTEGER, allowNull: false, field: 'tag_id' },
}, {
  tableName: 'post_tags',
  timestamps: false,
  indexes: [{ unique: true, fields: ['post_id', 'tag_id'] }],
});

module.exports = PostTag;

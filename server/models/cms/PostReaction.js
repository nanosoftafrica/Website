const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const PostReaction = sequelize.define('PostReaction', {
  postId:   { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  clientId: { type: DataTypes.STRING,  allowNull: false, field: 'client_id' },
  type:     { type: DataTypes.ENUM('like', 'love', 'insightful', 'celebrate'), allowNull: false },
}, {
  tableName: 'post_reactions',
  timestamps: true,
  updatedAt: false,
  indexes: [{ unique: true, fields: ['post_id', 'client_id', 'type'] }],
});

module.exports = PostReaction;

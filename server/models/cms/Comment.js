const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Comment = sequelize.define('Comment', {
  postId: { type: DataTypes.INTEGER, allowNull: false, field: 'post_id' },
  name:   { type: DataTypes.STRING,  allowNull: false },
  email:  { type: DataTypes.STRING,  allowNull: false },
  body:   { type: DataTypes.TEXT,    allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'spam'), defaultValue: 'pending' },
}, { tableName: 'comments', timestamps: true });

module.exports = Comment;

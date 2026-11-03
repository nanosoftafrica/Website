const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const ObjectMetadata = sequelize.define('ObjectMetadata', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name_singular: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z_]+$/,
    },
  },
  name_plural: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  label_singular: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  label_plural: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: '📦',
  },
  is_standard: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
  },
  updated_by_user_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'object_metadata',
  timestamps: true,
  underscored: true,
});

module.exports = ObjectMetadata;

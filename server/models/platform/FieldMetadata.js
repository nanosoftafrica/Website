const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const ObjectMetadata = require('./ObjectMetadata');

const FieldMetadata = sequelize.define('FieldMetadata', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  object_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: ObjectMetadata,
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      is: /^[a-z_]+$/,
    },
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'text, email, phone, number, currency, boolean, date, datetime, select, multi_select, relation, long_text',
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  unique_constraint: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  default_value: {
    type: DataTypes.TEXT,
  },
  placeholder: {
    type: DataTypes.STRING(255),
  },
  help_text: {
    type: DataTypes.TEXT,
  },
  // JSONB for type-specific config (options, relations, validation, etc.)
  config: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 999,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
  },
  updated_by_user_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'field_metadata',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['object_id'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['object_id', 'name'],
      unique: true,
    },
  ],
});

FieldMetadata.belongsTo(ObjectMetadata, { foreignKey: 'object_id' });

module.exports = FieldMetadata;

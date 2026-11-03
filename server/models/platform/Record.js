const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const ObjectMetadata = require('./ObjectMetadata');

const Record = sequelize.define('Record', {
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
  // All field values stored as JSON
  // Example: { name: 'Acme Corp', email: 'contact@acme.com', annual_revenue: 1000000 }
  data: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
  },
  updated_by_user_id: {
    type: DataTypes.INTEGER,
  },
  // For multi-user access control (Phase 2)
  assigned_to_user_id: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'records',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['object_id'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['assigned_to_user_id'],
    },
    {
      fields: ['object_id', 'created_at'],
    },
  ],
});

Record.belongsTo(ObjectMetadata, { foreignKey: 'object_id' });

module.exports = Record;

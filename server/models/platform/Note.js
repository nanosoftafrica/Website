const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Record = require('./Record');
const ObjectMetadata = require('./ObjectMetadata');

const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Link to parent record
  record_id: {
    type: DataTypes.UUID,
    references: {
      model: Record,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  record_object_id: {
    type: DataTypes.UUID,
    references: {
      model: ObjectMetadata,
      key: 'id',
    },
  },
  // Author
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'notes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['record_id'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

Note.belongsTo(Record, { foreignKey: 'record_id' });
Note.belongsTo(ObjectMetadata, { foreignKey: 'record_object_id' });

module.exports = Note;

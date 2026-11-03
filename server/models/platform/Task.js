const { DataTypes } = require('sequelize');
const sequelize = require('../../db');
const Record = require('./Record');
const ObjectMetadata = require('./ObjectMetadata');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('TODO', 'DONE'),
    defaultValue: 'TODO',
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
  // Assignment
  assigned_to_user_id: {
    type: DataTypes.INTEGER,
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Dates
  due_date: {
    type: DataTypes.DATEONLY,
  },
  due_time: {
    type: DataTypes.TIME,
  },
  reminder_sent_at: {
    type: DataTypes.DATE,
    comment: 'Track if reminder was sent to avoid duplicates',
  },
  completed_at: {
    type: DataTypes.DATE,
    comment: 'When marked DONE',
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['assigned_to_user_id', 'status'],
    },
    {
      fields: ['record_id'],
    },
    {
      fields: ['due_date'],
    },
    {
      fields: ['status'],
    },
  ],
});

Task.belongsTo(Record, { foreignKey: 'record_id' });
Task.belongsTo(ObjectMetadata, { foreignKey: 'record_object_id' });

module.exports = Task;

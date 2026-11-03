const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskReminder = sequelize.define('TaskReminder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    reminder_type: {
      type: DataTypes.ENUM('8am_daily', '1day_before'),
      allowNull: false,
    },
    scheduled_for: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'task_reminders',
    timestamps: false,
    underscored: true,
  });

  return TaskReminder;
};

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Message = sequelize.define('Message', {
  name:          { type: DataTypes.STRING },
  email:         { type: DataTypes.STRING },
  phone:         { type: DataTypes.STRING, defaultValue: '' },
  company:       { type: DataTypes.STRING, defaultValue: '' },
  interest:      { type: DataTypes.STRING, defaultValue: '' },
  message:       { type: DataTypes.TEXT, defaultValue: '' },
  read:          { type: DataTypes.BOOLEAN, defaultValue: false },
  preferredDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'preferred_date' },
  preferredTime: { type: DataTypes.STRING, allowNull: true, field: 'preferred_time' },
});

module.exports = Message;

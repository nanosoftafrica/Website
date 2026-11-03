const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Subscriber = sequelize.define('Subscriber', {
  email:  { type: DataTypes.STRING,  allowNull: false, unique: true, validate: { isEmail: true } },
  name:   { type: DataTypes.STRING,  defaultValue: '' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'subscribers', timestamps: true });

module.exports = Subscriber;

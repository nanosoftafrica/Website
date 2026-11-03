const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const WhatsAppMessage = sequelize.define(
  'WhatsAppMessage',
  {
    chatId: { type: DataTypes.STRING, allowNull: false, field: 'chat_id' },
    phone: { type: DataTypes.STRING, allowNull: false },
    contactId: { type: DataTypes.INTEGER, defaultValue: null, field: 'contact_id' },
    direction: { type: DataTypes.STRING, defaultValue: 'outbound' },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'sent' },
    wahaMessageId: { type: DataTypes.STRING, defaultValue: null, field: 'waha_message_id' },
  },
  {
    tableName: 'whatsapp_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = WhatsAppMessage;

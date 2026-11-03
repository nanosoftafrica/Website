const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Contact = sequelize.define('Contact', {
  firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
  lastName:  { type: DataTypes.STRING, defaultValue: '', field: 'last_name' },
  email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  phone:     { type: DataTypes.STRING, defaultValue: '' },
  jobTitle:  { type: DataTypes.STRING, defaultValue: '', field: 'job_title' },
  companyId: { type: DataTypes.INTEGER, defaultValue: null, field: 'company_id' },
  source:    { type: DataTypes.ENUM('website_form', 'manual', 'referral', 'import'), defaultValue: 'manual' },
  notes:     { type: DataTypes.TEXT, defaultValue: '' },
}, { tableName: 'contacts', timestamps: true });

module.exports = Contact;

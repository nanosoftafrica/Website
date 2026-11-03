const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../db');

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role:     { type: DataTypes.STRING, defaultValue: 'super_admin' }, // super_admin | editor
});

Admin.addHook('beforeCreate', async (admin) => {
  admin.password = await bcrypt.hash(admin.password, 12);
});
Admin.addHook('beforeUpdate', async (admin) => {
  if (admin.changed('password')) {
    admin.password = await bcrypt.hash(admin.password, 12);
  }
});

Admin.prototype.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = Admin;

const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

// The saved state of a website item just before an admin saved over it.
// Used by "Undo last save"; only the latest few per item are kept.
const ContentRevision = sequelize.define('ContentRevision', {
  entity:        { type: DataTypes.STRING(40), allowNull: false },   // page | post | product | case_study | content
  entityId:      { type: DataTypes.INTEGER,    allowNull: false, field: 'entity_id' },
  snapshot:      { type: DataTypes.JSONB,      allowNull: false },
  adminUsername: { type: DataTypes.STRING,     defaultValue: null, field: 'admin_username' },
}, {
  tableName: 'content_revisions',
  timestamps: true,
  updatedAt: false,
  indexes: [{ fields: ['entity', 'entity_id', 'createdAt'] }],
});

module.exports = ContentRevision;

/**
 * ProductCategory — ITIL Service Catalog taxonomy
 *
 * serviceType aligns to ITIL v4 service classification:
 *   business   — services delivered directly to end users / business units
 *   technical  — infrastructure and platform services that underpin business services
 *   supporting — internal / operational services
 *
 * ISO/IEC 20000-1 lifecycle states are tracked on each Product (see Product.js).
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const ProductCategory = sequelize.define('ProductCategory', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  icon: {
    type: DataTypes.STRING,   // emoji or icon class
    defaultValue: '📦',
  },
  // ITIL v4 service type classification
  serviceType: {
    type: DataTypes.ENUM('business', 'technical', 'supporting'),
    defaultValue: 'business',
    field: 'service_type',
  },
  // Short label shown in UI (e.g. "Business Service")
  serviceTypeLabel: {
    type: DataTypes.STRING,
    defaultValue: 'Business Service',
    field: 'service_type_label',
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#0096D6',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'product_categories',
});

module.exports = ProductCategory;

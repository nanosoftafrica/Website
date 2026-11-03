/**
 * Product — ITIL Service Catalog entry / ISO/IEC 20000 compliant
 *
 * lifecycleStatus follows ISO/IEC 20000-1 service lifecycle:
 *   pipeline  — in development / not yet released
 *   active    — currently offered and supported
 *   retiring  — still supported but no new sales
 *   retired   — end-of-life, no longer offered
 *
 * slaLevel maps to standard SLA tiers:
 *   basic      — business hours support, best-effort
 *   standard   — extended hours, defined response times
 *   enterprise — 24/7, dedicated support, guaranteed SLA
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

const Product = sequelize.define('Product', {

  // ── Identity ──────────────────────────────────────────────────────
  name:        { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, unique: true },
  subtitle:    { type: DataTypes.STRING, defaultValue: '' },
  description: { type: DataTypes.TEXT,   defaultValue: '' },

  // ── Taxonomy ──────────────────────────────────────────────────────
  category:   { type: DataTypes.STRING },                              // legacy plain-text label
  categoryId: { type: DataTypes.INTEGER, defaultValue: null, field: 'category_id' },

  // ── ITIL / ISO/IEC 20000 lifecycle ────────────────────────────────
  lifecycleStatus: {
    type: DataTypes.ENUM('pipeline', 'active', 'retiring', 'retired'),
    defaultValue: 'active',
    field: 'lifecycle_status',
  },

  // ── SLA tier ──────────────────────────────────────────────────────
  slaLevel: {
    type: DataTypes.ENUM('basic', 'standard', 'enterprise'),
    defaultValue: 'standard',
    field: 'sla_level',
  },

  // ── Target audience ───────────────────────────────────────────────
  targetAudience: {
    type: DataTypes.STRING,
    defaultValue: '',
    field: 'target_audience',
  },

  // ── Features (JSON array of strings) ──────────────────────────────
  features: { type: DataTypes.JSON, defaultValue: [] },

  // ── Benefits strip (JSON array of { icon, title, description }) ────
  benefits: { type: DataTypes.JSON, defaultValue: [] },

  // ── Branding ──────────────────────────────────────────────────────
  color:   { type: DataTypes.STRING, defaultValue: '#0096D6' },
  bgColor: { type: DataTypes.STRING, defaultValue: 'rgba(0,150,214,0.08)', field: 'bg_color' },
  image:   { type: DataTypes.STRING, defaultValue: null },

  // ── Assets ────────────────────────────────────────────────────────
  brochureUrl: { type: DataTypes.STRING, defaultValue: null, field: 'brochure_url' },

  // ── Metrics ───────────────────────────────────────────────────────
  clientCount: { type: DataTypes.INTEGER, defaultValue: 0, field: 'client_count' },

  // ── Display ───────────────────────────────────────────────────────
  order:  { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName: 'products',
});

module.exports = Product;

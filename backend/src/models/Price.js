import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Price = sequelize.define('Price', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  crop_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crops', key: 'id' } },
  market_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'markets', key: 'id' } },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  price_high: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  price_low: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  currency: { type: DataTypes.STRING(3), defaultValue: 'TZS' },
  unit: { type: DataTypes.STRING(20), defaultValue: 'kg' },
  recorded_by: { type: DataTypes.INTEGER, allowNull: true },
  recorded_at: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
}, {
  tableName: 'prices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Price;

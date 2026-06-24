import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Market = sequelize.define('Market', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  name_sw: { type: DataTypes.STRING(255), allowNull: true },
  region: { type: DataTypes.STRING(100), allowNull: true },
  district: { type: DataTypes.STRING(100), allowNull: true },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'markets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Market;

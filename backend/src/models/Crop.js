import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Crop = sequelize.define('Crop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  name_sw: { type: DataTypes.STRING(100), allowNull: true },
  category: { type: DataTypes.STRING(50), allowNull: true },
  unit: { type: DataTypes.STRING(20), defaultValue: 'kg' },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'crops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Crop;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Farmer = sequelize.define('Farmer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' }
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  region: { type: DataTypes.STRING(100) },
  district: { type: DataTypes.STRING(100) },
  village: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  preferred_language: {
    type: DataTypes.ENUM('en', 'sw'),
    defaultValue: 'en'
  },
  profile_image: { type: DataTypes.STRING(255) }
}, {
  tableName: 'farmers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Farmer;
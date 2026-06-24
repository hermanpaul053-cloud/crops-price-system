import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  farmer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'farmers', key: 'id' } },
  crop_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'crops', key: 'id' } },
  market_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'markets', key: 'id' } },
  notification_type: { type: DataTypes.ENUM('sms', 'email', 'in_app'), defaultValue: 'sms' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Subscription;

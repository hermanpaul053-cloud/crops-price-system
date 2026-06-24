import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  role: { type: DataTypes.ENUM('farmer', 'admin'), defaultValue: 'farmer' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  reset_token: { type: DataTypes.STRING(255), allowNull: true },
  reset_token_expiry: { type: DataTypes.DATE, allowNull: true },
  last_login: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/;

const hashPasswordIfNeeded = async (user) => {
  if (user.changed('password') && user.password && !BCRYPT_HASH_PATTERN.test(user.password)) {
    user.password = await bcrypt.hash(user.password, 10);
  }
};

User.beforeCreate(hashPasswordIfNeeded);
User.beforeUpdate(hashPasswordIfNeeded);

User.prototype.comparePassword = async function(password) {
  if (!password || !this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

export default User;

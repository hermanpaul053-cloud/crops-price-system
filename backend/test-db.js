import sequelize from './src/config/database.js';

try {
  await sequelize.authenticate();
  console.log('✅ Database connection successful!');
  await sequelize.close();
} catch (error) {
  console.error('❌ Connection failed:', error.message);
}
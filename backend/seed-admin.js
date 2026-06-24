import sequelize from './src/config/database.js';
import User from './src/models/User.js';
import Admin from './src/models/Admin.js';

try {
  await sequelize.authenticate();

  const [user, created] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      is_active: true
    }
  });

  if (!created) {
    await user.update({
      password: 'admin123',
      role: 'admin',
      is_active: true
    });
  }

  await Admin.findOrCreate({
    where: { user_id: user.id },
    defaults: {
      user_id: user.id,
      full_name: 'System Admin',
      phone: '0712345678'
    }
  });

  console.log('Admin account ready: admin@example.com / admin123');
  process.exit(0);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

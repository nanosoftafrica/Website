// Make sure you've run: npm install (in the root, not server/)
// Then run: cd server && node reset-password.js

const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = (value || '').trim();
  }
});

async function resetPassword() {
  try {
    const sequelize = require('./db');
    const Admin = require('./models/platform/Admin');

    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const username = 'admin';
    const newPassword = process.env.ADMIN_PASSWORD;
    if (!newPassword) throw new Error('Set ADMIN_PASSWORD in .env.local before running this script.');

    // Find existing admin
    let admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      // Create new admin if doesn't exist
      console.log('  Admin not found, creating...');
      admin = await Admin.create({ username, password: newPassword, role: 'super_admin' });
    } else {
      // Update existing admin password
      admin.password = newPassword;
      await admin.save();
    }

    console.log('\n✓ Admin password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Username: ${username}`);
    console.log('  Password: (value of ADMIN_PASSWORD in .env.local)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check DATABASE_URL in .env.local');
    console.error('  3. Run: npm install (from root directory first)');
    process.exit(1);
  }
}

resetPassword();

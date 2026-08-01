const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const existingAdmin = await User.findOne({ email: 'admin@fooddonation.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@fooddonation.com',
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      status: 'approved'
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('Email: admin@fooddonation.com');
    console.log('Password: admin123');
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
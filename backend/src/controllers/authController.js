const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// =====================
// KHAI BÁO TRƯỚC (DI CHUYỂN LÊN TRÊN)
// =====================

// Allowed school domains
const SCHOOL_DOMAINS = ['@truongdaihoc.edu.vn', '@school.edu.vn'];


// Infer role from email suffix (first segment before @domain)
const inferRole = (email) => {
  const local = email.split('@')[0]; // e.g. "GV001" or "SV2023001"
  const prefix = local.substring(0, 2).toUpperCase();
  if (prefix === 'GV') return 'teacher';
  if (prefix === 'CB') return 'admin';
  return 'student';
};

// Seed data: tự động tạo tài khoản test khi khởi động
let users = [];

// Hàm tạo seed users
const createSeedUsers = async () => {
  const seedPassword = '123456';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(seedPassword, salt);

  const seedUsers = [
    {
      id: '1',
      fullName: 'Sinh viên Test',
      email: 'student1@school.edu.vn',
      password: hashedPassword,
      role: 'student',
      comparePassword: async (pw) => bcrypt.compare(pw, hashedPassword),
      toJSON: function() { const { password, ...rest } = this; return rest; }
    },
    {
      id: '2',
      fullName: 'Giảng viên Test',
      email: 'lecturer1@school.edu.vn',
      password: hashedPassword,
      role: 'teacher',
      comparePassword: async (pw) => bcrypt.compare(pw, hashedPassword),
      toJSON: function() { const { password, ...rest } = this; return rest; }
    },
    {
      id: '3',
      fullName: 'Quản trị Test',
      email: 'admin1@school.edu.vn',
      password: hashedPassword,
      role: 'admin',
      comparePassword: async (pw) => bcrypt.compare(pw, hashedPassword),
      toJSON: function() { const { password, ...rest } = this; return rest; }
    }
  ];

  users = seedUsers;
  logger.info('Seed users đã được tạo: student1@school.edu.vn (student), lecturer1@school.edu.vn (teacher), admin1@school.edu.vn (admin)');
};

// Gọi seed khi module được load
createSeedUsers().catch(err => logger.error('Lỗi tạo seed:', err));

// =====================
// HELPER FUNCTIONS
// =====================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user.email,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'fallback_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// =====================
// CONTROLLERS
// =====================

// Register
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Cần điền đầy đủ họ tên, email, mật khẩu.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check school domain
    const isSchoolEmail = SCHOOL_DOMAINS.some(d => normalizedEmail.endsWith(d));
    if (!isSchoolEmail) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận email do Trường cấp (@truongdaihoc.edu.vn).',
      });
    }

    // Auto-assign role from email prefix (GV=teacher, CB=admin, else student)
    const role = inferRole(normalizedEmail);

    // Mock findOne
    const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được đăng ký.',
      });
    }

    // Mock create
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      id: Date.now().toString(),
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      comparePassword: async (pw) => bcrypt.compare(pw, hashedPassword),
      toJSON: function() {
        const { password, ...rest } = this;
        return rest;
      }
    };
    users.push(user);

    // Send welcome email
    try {
      const { sendWelcomeEmail } = require('../utils/email');
      await sendWelcomeEmail(user);
    } catch (emailError) {
      logger.warn(`Welcome email failed for ${user.email}: ${emailError.message}`);
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Đăng ký thất bại.',
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    // Support both payload styles:
    // - { email, password }
    // - { identifier, password }
    const { email, identifier, password } = req.body;

    const loginEmail = (identifier || email);

    if (!loginEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/identifier và mật khẩu bắt buộc.',
      });
    }

    const normalizedEmail = loginEmail.toLowerCase().trim();


    // Check school domain
    const isSchoolEmail = SCHOOL_DOMAINS.some(d => normalizedEmail.endsWith(d));
    if (!isSchoolEmail) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận email do Trường cấp (@truongdaihoc.edu.vn).',
      });
    }

    // Mock findOne
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
      });
    }

    // Mock update lastLogin
    user.lastLogin = new Date();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Đăng nhập thất bại.',
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id || u.email === req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: user.toJSON ? user.toJSON() : user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
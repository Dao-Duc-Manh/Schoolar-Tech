const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const logger = require('../utils/logger');

// Enroll student
const enrollStudent = async (req, res) => {
  try {
    const { userId, classId } = req.body;

    const existing = await Student.findOne({ where: { userId, classId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Student already enrolled',
      });
    }

    const student = await Student.create({
      userId,
      classId,
      studentCode: `STU-${Date.now()}`,
    });

    const classData = await Class.findByPk(classId);
    await classData.update({ currentEnrollment: classData.currentEnrollment + 1 });

    const studentWithData = await Student.findByPk(student.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
        { model: Class, as: 'class', attributes: ['id', 'name', 'code'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: studentWithData,
    });
  } catch (error) {
    logger.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Enrollment failed',
    });
  }
};

// Get students in class
const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
      where: { classId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
      ],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
    });
  }
};

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] },
        { model: Class, as: 'class' },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    logger.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, midtermGrade, finalGrade, attendance } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await student.update({
      ...(status && { status }),
      ...(midtermGrade !== undefined && { midtermGrade }),
      ...(finalGrade !== undefined && { finalGrade }),
      ...(attendance !== undefined && { attendance }),
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    logger.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
    });
  }
};

module.exports = {
  enrollStudent,
  getClassStudents,
  getStudentProfile,
  updateStudent,
};

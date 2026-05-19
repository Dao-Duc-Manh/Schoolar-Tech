const Grade = require('../models/Grade');
const Student = require('../models/Student');
const User = require('../models/User');
const logger = require('../utils/logger');

// Add grade
const addGrade = async (req, res) => {
  try {
    const { studentId, assessmentName, assessmentType, score, maxScore, feedback } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const percentage = (score / maxScore) * 100;

    const grade = await Grade.create({
      studentId,
      assessmentName,
      assessmentType,
      score,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      feedback,
    });

    // Send grade notification
    try {
      const studentWithUser = await Student.findByPk(studentId, { include: [{ model: User, as: 'user' }] });
      if (studentWithUser && studentWithUser.user && studentWithUser.user.email) {
        const { sendGradeNotification } = require('../utils/email');
        await sendGradeNotification(studentWithUser.user.email, {
          assessmentName,
          score,
          maxScore,
          percentage,
          feedback: feedback || 'No feedback'
        });
      }
    } catch (emailError) {
      logger.warn(`Grade notification failed: ${emailError.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Grade added successfully',
      data: grade,
    });
  } catch (error) {
    logger.error('Add grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add grade',
    });
  }
};

// Get student grades
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    const grades = await Grade.findAll({
      where: { studentId },
      order: [['gradeDate', 'DESC']],
    });

    res.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    logger.error('Get grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grades',
    });
  }
};

// Update grade
const updateGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { score, maxScore, feedback } = req.body;

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found',
      });
    }

    const newScore = score !== undefined ? score : grade.score;
    const newMaxScore = maxScore !== undefined ? maxScore : grade.maxScore;
    const percentage = (newScore / newMaxScore) * 100;

    await grade.update({
      score: newScore,
      maxScore: newMaxScore,
      feedback,
      percentage: Math.round(percentage * 100) / 100,
    });

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: grade,
    });
  } catch (error) {
    logger.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade',
    });
  }
};

// Get grade report
const getGradeReport = async (req, res) => {
  try {
    const { studentId, classId } = req.query;

    const where = {};
    if (studentId) where.studentId = studentId;

    const grades = await Grade.findAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          where: classId ? { classId } : {},
          include: [
            { model: User, as: 'user' }
          ]
        },
      ],
      order: [['gradeDate', 'DESC']],
    });

    const stats = {
      total: grades.length,
      average: grades.length > 0 
        ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length * 100) / 100
        : 0,
      highest: grades.length > 0 ? Math.max(...grades.map(g => g.percentage)) : 0,
      lowest: grades.length > 0 ? Math.min(...grades.map(g => g.percentage)) : 0,
    };

    res.json({
      success: true,
      data: grades,
      statistics: stats,
    });
  } catch (error) {
    logger.error('Grade report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade report',
    });
  }
};

module.exports = {
  addGrade,
  getStudentGrades,
  updateGrade,
  getGradeReport,
};

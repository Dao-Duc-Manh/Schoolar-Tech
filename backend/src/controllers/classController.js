const Class = require('../models/Class');
const User = require('../models/User');
const logger = require('../utils/logger');

// Create class
const createClass = async (req, res) => {
  try {
    const { name, code, description, semester, capacity } = req.body;
    const teacherId = req.user.id;

    const newClass = await Class.create({
      name,
      code,
      description,
      semester,
      capacity,
      teacherId,
    });

    const classWithTeacher = await Class.findByPk(newClass.id, {
      include: [{ model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] }],
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classWithTeacher,
    });
  } catch (error) {
    logger.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create class',
    });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Class.findAndCountAll({
      include: [{ model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] }],
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
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
    logger.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
    });
  }
};

// Get class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id, {
      include: [{ model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] }],
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    logger.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class',
    });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, semester, capacity, status } = req.body;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (classData.teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await classData.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(semester && { semester }),
      ...(capacity && { capacity }),
      ...(status && { status }),
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData,
    });
  } catch (error) {
    logger.error('Update class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update class',
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (classData.teacherId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await classData.destroy();

    res.json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    logger.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
    });
  }
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
};

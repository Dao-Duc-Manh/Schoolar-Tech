module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Assignment = sequelize.define(
    'Assignment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      classId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      teacherId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      dueDate: {
        type: DataTypes.DATE,
      },

      maxScore: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10,
      },

      // Nơi lưu đề bài (file ppt/pdf/canvas-export...)
      // Có thể dùng cách lưu giống Document.
      problemFileName: {
        type: DataTypes.STRING(500),
      },
      problemFilePath: {
        type: DataTypes.STRING(500),
      },
      problemFileType: {
        type: DataTypes.STRING(100),
      },

      // trạng thái hiển thị cho SV
      status: {
        type: DataTypes.ENUM('draft', 'published', 'closed'),
        defaultValue: 'published',
      },
    },
    {
      timestamps: true,
      tableName: 'assignments',
    }
  );

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
    Assignment.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
    Assignment.hasMany(models.Submission, { as: 'submissions', foreignKey: 'assignmentId' });
  };

  return Assignment;
};


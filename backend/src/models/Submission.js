module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Submission = sequelize.define(
    'Submission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      assignmentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      // file nộp (MVP upload file)
      answerFileName: {
        type: DataTypes.STRING(500),
      },
      answerFilePath: {
        type: DataTypes.STRING(500),
      },
      answerFileType: {
        type: DataTypes.STRING(100),
      },

      // phase 2 (làm trực tiếp) sẽ dùng answerText
      answerText: {
        type: DataTypes.TEXT,
      },

      // chấm
      status: {
        type: DataTypes.ENUM('submitted', 'graded'),
        defaultValue: 'submitted',
      },

      submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      gradedAt: {
        type: DataTypes.DATE,
      },

      score: {
        type: DataTypes.FLOAT,
      },
      feedback: {
        type: DataTypes.TEXT,
      },

      // ghi chú: để chống nộp lại nhiều lần tuỳ logic
      // (MVP có thể cho phép nộp lại => cập nhật record)
      updatedBy: {
        type: DataTypes.UUID,
      },
    },
    {
      timestamps: true,
      tableName: 'submissions',
    }
  );

  Submission.associate = (models) => {
    Submission.belongsTo(models.Assignment, { as: 'assignment', foreignKey: 'assignmentId' });
    Submission.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
  };

  return Submission;
};


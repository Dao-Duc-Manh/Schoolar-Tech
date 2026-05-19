module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Grade = sequelize.define('Grade', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    assessmentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    assessmentType: {
      type: DataTypes.ENUM('quiz', 'assignment', 'midterm', 'final'),
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxScore: {
      type: DataTypes.FLOAT,
      defaultValue: 10,
    },
    percentage: {
      type: DataTypes.FLOAT,
    },
    feedback: {
      type: DataTypes.TEXT,
    },
    gradeDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'grades',
  });

  // Define associations
  Grade.associate = (models) => {
    Grade.belongsTo(models.Student, { as: 'student', foreignKey: 'studentId' });
    Grade.belongsTo(models.Class, { foreignKey: 'classId' });
  };

  return Grade;
};
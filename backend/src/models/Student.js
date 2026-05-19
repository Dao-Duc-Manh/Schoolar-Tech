module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    studentCode: {
      type: DataTypes.STRING(50),
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'dropped', 'completed'),
      defaultValue: 'active',
    },
    midtermGrade: {
      type: DataTypes.FLOAT,
    },
    finalGrade: {
      type: DataTypes.FLOAT,
    },
    attendance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    tableName: 'students',
  });

  // Define associations
  Student.associate = (models) => {
    Student.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Student.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
  };

  return Student;
};
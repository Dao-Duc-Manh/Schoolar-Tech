module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Class = sequelize.define('Class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    semester: {
      type: DataTypes.STRING(20),
    },
    schedule: {
      type: DataTypes.JSON,
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    currentEnrollment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'archived'),
      defaultValue: 'active',
    },
  }, {
    timestamps: true,
    tableName: 'classes',
  });

  // Define associations in associate method
  Class.associate = (models) => {
    Class.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
    Class.hasMany(models.Student, { foreignKey: 'classId' });
    Class.hasMany(models.Grade, { foreignKey: 'classId' });
  };

  return Class;
};
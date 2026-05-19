module.exports = (sequelize, Sequelize) => {
  const { DataTypes } = Sequelize;

  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    fileName: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
    },
    fileType: {
      type: DataTypes.STRING(50),
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    classId: {
      type: DataTypes.UUID,
    },
    documentType: {
      type: DataTypes.ENUM('material', 'assignment', 'resource'),
      defaultValue: 'material',
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    tableName: 'documents',
  });

  // Define associations
  Document.associate = (models) => {
    Document.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploadedBy' });
    Document.belongsTo(models.Class, { as: 'class', foreignKey: 'classId' });
  };

  return Document;
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'Messages',
    indexes: [{
      fields: ['classId', 'timestamp']
    }, {
      fields: ['userId']
    }]
  });

Message.associate = (models) => {
    Message.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Message.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Message;
};

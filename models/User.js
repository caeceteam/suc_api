/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    idUser: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bornDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    role: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    pass: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    docNum: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    street: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    streetNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    floor: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    door: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'User'
  });
};

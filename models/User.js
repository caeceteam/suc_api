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
      type: DataTypes.STRING(45),
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true
    },
    pass: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Diner',
        key: 'idDiner'
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    state: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    docNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bornDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'User'
  });
};

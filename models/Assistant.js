/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Assistant', {
    idAssistant: {
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
    bornDate: {
      type: DataTypes.DATE,
      allowNull: false
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
    },
    zipCode: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contactName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    scholarship: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    eatAtOwnHouse: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    economicSituation: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    celiac: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    diabetic: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    document: {
      type: DataTypes.STRING(13),
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'Assistant'
  });
};

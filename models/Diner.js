/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Diner', {
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    state: {
      type: DataTypes.INTEGER(11),
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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    link: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mail: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    timestamps:false,
    tableName: 'Diner'
  });
};

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
    street: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    streetNumber: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    floor: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    door: {
      type: DataTypes.STRING(5),
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
      type: DataTypes.STRING(8),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    link: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mail: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    idCity: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'Diner'
  });
};

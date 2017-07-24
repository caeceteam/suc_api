/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Event', {
    idEvent: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'diner',
        key: 'idDiner'
      }
    }
  }, {
    timestamps:false,
    tableName: 'Event'
  });
};

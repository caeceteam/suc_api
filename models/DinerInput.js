/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DinerInput', {
    idDinerInput: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'diner',
        key: 'idDiner'
      }
    },
    idInputType: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'InputType',
        key: 'idInputType'
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    genderType: {
      type: DataTypes.CHAR(1),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'DinerInput'
  });
};

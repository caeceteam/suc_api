/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DinerFood', {
    idDinerFood: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'diner',
        key: 'idDiner'
      }
    },
    idFoodType: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'FoodType',
        key: 'idFoodType'
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    unity: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    endingDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'DinerFood'
  });
};

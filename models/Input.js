/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Input', {
    idInput: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idInputType: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'InputType',
        key: 'idInputType'
      }
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    size: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    gender: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    quantity: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'Input'
  });
};

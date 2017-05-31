/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('InputType', {
    idInputType: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'InputType'
  });
};

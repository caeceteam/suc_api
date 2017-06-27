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
      type: DataTypes.STRING(10),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'InputType'
  });
};

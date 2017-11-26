/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Family', {
    idFamily: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idAssistant: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Assistant',
        key: 'idAssistant'
      }
    },
    Description: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'Family'
  });
};

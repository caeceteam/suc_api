/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DinerAssistant', {
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Diner',
        key: 'idDiner'
      }
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
    active: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    }
  }, {
    timestamps:false,
    tableName: 'DinerAssistant'
  });
};

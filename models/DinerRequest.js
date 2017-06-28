/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DinerRequest', {
    idDinerRequest: {
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
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    timestamps:false,
    tableName: 'DinerRequest'
  });
};

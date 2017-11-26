/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('DinerPhoto', {
    idDiner: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'diner',
        key: 'idDiner'
      }
    },
    idPhoto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
      timestamps: false,
      tableName: 'DinerPhoto'
    });
};

/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('EventPhoto', {
    idEvent: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'event',
        key: 'idEvent'
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
    timestamps:false,
    tableName: 'EventPhoto'
  });
};

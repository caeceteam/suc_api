/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DinerRequestStatus', {
    idRequest: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'DinerRequest',
        key: 'idDinerRequest'
      }
    },
    idReceiver: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'idUser'
      }
    },
    status: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    timestamps:false,
    tableName: 'DinerRequestStatus'
  });
};

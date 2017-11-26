/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Donation', {
    idDonation: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idUserSender: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'User',
        key: 'idUser'
      }
    },
    idDinerReceiver: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Diner',
        key: 'idDiner'
      }
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(3),
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'Donation'
  });
};

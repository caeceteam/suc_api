/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Donation', {
    idDonation: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idSender: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'User',
        key: 'idUser'
      }
    },
    idReciever: {
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'Donation'
  });
};

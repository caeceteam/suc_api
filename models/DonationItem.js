/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DonationItem', {
    idItem: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    idDonation: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Donation',
        key: 'idDonation'
      }
    },
    inputType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    foodType: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unit: {
      type: DataTypes.CHAR(5),
      allowNull: true
    }
  }, {
    timestamps:false,
    tableName: 'DonationItem'
  });
};

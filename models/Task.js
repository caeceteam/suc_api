/* jshint indent: 2 */
"use strict";

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('task', {
    Id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    Title: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    Status: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'task'
  });
};

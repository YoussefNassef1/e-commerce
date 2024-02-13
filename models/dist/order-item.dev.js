"use strict";

var Sequelize = require("sequelize");

var sequelize = require("../util/database");

var OrderItem = sequelize.define("orderItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});
module.exports = OrderItem;
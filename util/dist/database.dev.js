"use strict";

var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var _db;

var mongoConnect = function mongoConnect(callback) {
  MongoClient.connect("mongodb+srv://YoussefNassef:Youssef2345@cluster0.duccz.mongodb.net/shop?retryWrites=true&w=majority").then(function (client) {
    console.log("connected");
    _db = client.db();
    callback();
  })["catch"](function (err) {
    console.log(err);
    throw err;
  });
};

var getDb = function getDb() {
  if (_db) {
    return _db;
  }

  throw 'no database Found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
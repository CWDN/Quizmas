'use strict';

exports.up = function (next) {
  var db = getDBConnection();
  db.serialize(function () {
    db.run('CREATE TABLE answers (game TEXT, teamName TEXT, answer TEXT, questionId INTEGER, correct BOOLEAN)');
  });
  db.close(function () {
    next();
  });
};

exports.down = function (next) {
  var db = getDBConnection();
  db.serialize(function () {
    db.run('DROP TABLE IF EXISTS answers');
  });
  db.close(function () {
    next();
  });
};

function getDBConnection () {
  var sqlite3 = require('sqlite3').verbose();
  return new sqlite3.Database('database/quiz.sqlite');
}

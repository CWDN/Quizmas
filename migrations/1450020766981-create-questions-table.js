'use strict';

exports.up = function (next) {
  var db = getDBConnection();
  db.serialize(function () {
    db.run('CREATE TABLE questions(id INTEGER PRIMARY KEY, question TEXT, options TEXT, correctAnswer TEXT, difficulty TEXT, category TEXT)');
  });
  db.close(function () {
    next();
  });
};

exports.down = function (next) {
  var db = getDBConnection();
  db.serialize(function () {
    db.run('DROP TABLE IF EXISTS questions');
  });
  db.close(function () {
    next();
  });
};

function getDBConnection () {
  var sqlite3 = require('sqlite3').verbose();
  return new sqlite3.Database('database/quiz.sqlite');
}

var sqlite3 = require('sqlite3').verbose();

function Game () {
}

Game.prototype.getName = function () {
  return this.name;
};

Game.prototype.setName = function (name) {
  this.name = name;
};

Game.prototype.create = function () {
  var db = getDBConnection();
  var game = this;
  db.serialize(function () {
    var stmt = db.prepare('INSERT INTO games VALUES (?)');
    stmt.run(game.getName());
    stmt.finalize();
  });
  db.close();
};

Game.getByName = function (name) {
  var db = getDBConnection();
  db.serialize(function () {
    db.run('CREATE TABLE game (name TEXT)');
  });
  db.close();
};

function getDBConnection () {
  return new sqlite3.Database('database/quiz.sqlite');
}

module.exports = Game;

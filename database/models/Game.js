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

/**
 * Imports the data from the given object into this game object.
 * @param  {Object} object
 * @return {Game}
 */
Game.prototype.importFromDBObject = function (object) {
  if (object.name !== undefined) {
    this.setName(object.name);
    this.fromDatabase = true;
  }
  return this;
};

/**
 * Gets a game from the name given.
 * @param  {string} name
 * @return {Game|undefined}
 */
Game.getByName = function (name) {
  var db = getDBConnection();
  var result;
  var sync = true;
  db.serialize(function () {
    var stmt = db.prepare('SELECT * FROM games WHERE name=?');
    stmt.run(name);
    stmt.all(function (err, res) {
      if (err) throw err;
      result = res;
    });
    stmt.finalize(function () {
      sync = false;
      db.close();
    });
  });
  while(sync) {
    require('deasync').sleep(100);
  }
  if (result.length > 0) {
    result = result.pop();
  } else {
    return undefined;
  }
  var game = new Game();
  game.importFromDBObject(result);
  return game;
};

function getDBConnection () {
  return new sqlite3.Database('database/quiz.sqlite');
}

module.exports = Game;

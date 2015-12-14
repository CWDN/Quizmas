var sqlite3 = require('sqlite3').verbose();

/**
 * Constructor.
 */
function Team () {
  this.name = '';
  this.socketId = '';
  this.game = '';
}

/**
 * Gets the name of the team.
 * @return {string}
 */
Team.prototype.getName = function () {
  return this.name;
};

/**
 * Sets the name of the team.
 * @param {string} name
 */
Team.prototype.setName = function (name) {
  this.name = name;
};

/**
 * Gets the socketId of the team.
 * @return {string}
 */
Team.prototype.getSocketId = function () {
  return this.socketId;
};

/**
 * Sets the socketId of the team.
 * @param {string} socketId
 */
Team.prototype.setSocketId = function (socketId) {
  this.socketId = socketId;
};

/**
 * Gets the game of the team.
 * @return {string}
 */
Team.prototype.getGame = function () {
  return this.game;
};

/**
 * Sets the game of the team.
 * @param {string} game
 */
Team.prototype.setGame = function (game) {
  this.game = game;
};

/**
 * Stores the current team object into the database.
 */
Team.prototype.create = function () {
  var db = getDBConnection();
  var team = this;
  db.serialize(function () {
    var stmt = db.prepare('INSERT INTO teams VALUES (?, ?, ?)');
    stmt.run([
      team.getName(),
      team.getSocketId(),
      team.getGame()
    ]);
    stmt.finalize(function () {
      db.close();
    });
  });
};

Team.prototype.save = function () {
  var db = getDBConnection();
  var team = this;
  db.serialize(function () {
    var stmt = db.prepare('UPDATE teams SET team=?, socketId=?, game=? WHERE team=?');
    stmt.run([
      team.getName(),
      team.getSocketId(),
      team.getGame(),
      team.getName()
    ]);
    stmt.finalize(function () {
      db.close();
    });
  });
};

Team.prototype.importFromObject = function (object) {
  if (object === undefined) {
    return undefined;
  }
  this.setName(object.name);
  this.setSocketId(object.socketId);
  this.setGame(object.game);

  return this;
};

Team.createFromObject = function (object) {
  var team = new Team();
  team.importFromObject(object);
  team.create();
  return team;
};

Team.getByGame = function (game) {
  var db = getDBConnection();
  var result;
  var sync = true;
  db.serialize(function () {
    var stmt = db.prepare('SELECT * FROM teams WHERE game=?');
    stmt.run(game);
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
  if (result.length === 0) {
    return [];
  }

  var teamObjects = result.map(function (item) {
    var team = new Team();
    return team.importFromObject(item);
  });

  return teamObjects;
};

/**
 * Gets the sqlite db.
 * @return {sqlite.Database}
 */
function getDBConnection () {
  return new sqlite3.Database('database/quiz.sqlite');
}

module.exports = Team;

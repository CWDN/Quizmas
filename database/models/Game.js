var sqlite3 = require('sqlite3').verbose();
var Team = require('./Team');

/**
 * Constructor.
 */
function Game () {
  this.teams = [];
  this.teamsAnswers = {};
  this.name = '';
}

/**
 * Gets the name of the game.
 * @return {string}
 */
Game.prototype.getName = function () {
  return this.name;
};

/**
 * Sets the name of the game.
 * @param {string} name
 */
Game.prototype.setName = function (name) {
  this.name = name;
};

Game.prototype.addTeam = function (teamName) {
  var team = Team.createFromObject({
    name: teamName,
    socketId: '',
    game: this.getName()
  });
  this.teams.push(team);
};

Game.prototype.getTeams = function () {
  return this.teams;
};

/**
 * Stores the current game object into the database.
 */
Game.prototype.create = function () {
  var db = getDBConnection();
  var game = this;
  db.serialize(function () {
    var stmt = db.prepare('INSERT INTO games VALUES (?)');
    stmt.run([game.getName()]);
    stmt.finalize(function () {
      db.close();
    });
  });
};

/**
 * Imports the data from the given object into this game object.
 * @param  {Object} object
 * @return {Game}
 */
Game.prototype.importFromObject = function (object, callback) {
  if (object === undefined) {
    callback(object);
    return;
  }

  if (object.name !== undefined) {
    this.setName(object.name);
    var game = this;
    Team.getByGame(this.getName(), function (teams) {
      game.teams = teams;
      if (callback !== undefined) {
        callback(game);
      }
    });
  }
};

/**
 * Gets a game from the name given.
 * @param  {string} name
 * @return {Game|undefined}
 */
Game.getByName = function (name, callback) {
  var db = getDBConnection();
  var result;
  db.serialize(function () {
    var stmt = db.prepare('SELECT * FROM games WHERE name=?');
    stmt.run(name);
    stmt.all(function (err, res) {
      if (err) throw err;
      result = res;
    });
    stmt.finalize(function () {
      db.close();
      if (result.length > 0) {
        result = result.pop();
      } else {
        callback(undefined);
        return;
      }
      var game = new Game();
      game.importFromObject(result, callback);
    });
  });
};

Game.prototype.storeTeamAnswer = function (socketId, answer, questionId, callback) {
  var game = this;
  Team.getBySocketId(socketId, function (team) {
    team.storeAnswer(questionId, answer, function () {
      game.teamsAnswers[socketId] = true;
      game.getTeams().forEach(function (item) {
        if (game.teamsAnswers[item.getSocketId()] === undefined) {
          callback(false);
        }
      });
      callback(true);
    });
  });
};

/**
 * Gets the sqlite db.
 * @return {sqlite.Database}
 */
function getDBConnection () {
  return new sqlite3.Database('database/quiz.sqlite');
}

module.exports = Game;

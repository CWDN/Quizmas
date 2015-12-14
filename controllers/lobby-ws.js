var io = require('../server').io;
var Team = require('../database/models/Team');

function Lobby (game) {
  this.game = game;

  this.startWebSockets = function () {
    var nsp = io.of('/' + this.game.getName());
    nsp.on('connection', function (socket) {
      socket.on('join', function (data) {
        Team.getByTeamAndGame(data.team, data.game, function (team) {
          team.setSocketId(socket.id);
          team.save();
        });
      });

      socket.on('disconnect', function () {
        Team.getBySocketId(socket.id, function (team) {
          team.delete();
        });
      });
    });
  };

  this.startWebSockets();
}

module.exports = Lobby;

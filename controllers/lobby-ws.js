var server = require('../server');
var io = server.io;
var app = server.app;
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
        socket.broadcast.emit('new-team', {
          team: data.team
        });
      });

      socket.on('disconnect', function () {
        Team.getBySocketId(socket.id, function (team) {
          if (team === undefined) {
            return;
          }
          socket.broadcast.emit('remove-team', {
            team: team.getName()
          });
          team.delete();
        });
      });

      socket.on('next-question', function () {
        nextQuestion(['Answer1', 'Answer2']);
      });

      socket.on('send-answer', function (data) {
        console.log(data);
        nextQuestion(['ONE', 'TWO', 'THREE', 'FOUR']);
      });
    });

    function nextQuestion (answers) {
        app.render('question', {layout: false, answers: answers}, function (err, html) {
          if (err) {
            console.log(err);
          }
          nsp.emit('page', {
            html: html
          });
          var totalSeconds = 30;
          var secondsLeft = totalSeconds;
          var intervalId = setInterval(function () {
            secondsLeft--;
            if (secondsLeft <= 0) {
              clearInterval(intervalId)
            }
            nsp.emit('countdown-reduce', {
              totalSeconds: totalSeconds,
              secondsLeft: secondsLeft
            });
          }, 1000);
        });
    }
  };

  this.startWebSockets();
}

module.exports = Lobby;

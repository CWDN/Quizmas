var server = require('../server');
var io = server.io;
var app = server.app;
var Team = require('../database/models/Team');
var Quiz = require('../quiz');

function Lobby (game) {
  this.game = game;

  this.startWebSockets = function () {
    var nsp = io.of('/' + this.game.getName());
    var quiz = new Quiz(['General Knowledge'], {
      hard: 5,
      medium: 10,
      easy: 15
    }, game);
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
        var state = quiz.getNextQuestion(function (question) {
          app.render('question', {
            layout: false,
            answers: question.getOptions(),
            question: question.getQuestion()
          }, function (err, html) {
            if (err) {
              console.log(err);
            }
            nsp.emit('page', {
              html: html
            });
          });
        });

        if (state === 'EndQuiz') {

        }
        if (state === 'EndCategory') {

        }
      });

      socket.on('send-answer', function (data) {
        console.log(data);
      });
    });
  };

  this.startWebSockets();
}

module.exports = Lobby;

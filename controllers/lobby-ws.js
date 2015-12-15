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
    }, this.game);
    var game = this.game;
    var questionSeconds = 30;
    var secondsLeft = questionSeconds;
    var isPaused = false;
    var countdownInterval;

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
        getNextQuestion();
      });

      socket.on('send-answer', function (data) {
        game.storeTeamAnswer(
          socket.id,
          data.answer,
          quiz.getQuestionId(),
          function (allTeamsAnswered) {
            if (allTeamsAnswered) {
              clearInterval(countdownInterval);
              getNextQuestion();
            }
          });
      });
    });

    function getNextQuestion () {
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

          questionSeconds = quiz.getQuestionTimeByDifficulty(question.getDifficulty());
          secondsLeft = questionSeconds;
          console.log(questionSeconds);

          countdownInterval = setInterval(function () {
            if (isPaused) {
              return;
            }
            secondsLeft--;
            console.log(secondsLeft);
            if (secondsLeft <= 0) {
              clearInterval(countdownInterval);
              getNextQuestion();
            }
            nsp.emit('countdown-reduce', {
              questionSeconds: questionSeconds,
              secondsLeft: secondsLeft
            });
          }, 1000);
        });
      });

      if (state === 'EndQuiz') {

      }
      if (state === 'EndCategory') {

      }
    }
  };

  this.startWebSockets();
}

module.exports = Lobby;

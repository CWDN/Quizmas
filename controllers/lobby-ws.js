var server = require('../server');
var io = server.io;
var app = server.app;
var Team = require('../database/models/Team');
var Quiz = require('../quiz');
var Game = require('../database/models/Game');

function Lobby (game) {
  this.game = game;

  this.startWebSockets = function () {
    var nsp = io.of('/' + this.game.getName());
    var quiz = new Quiz(['General Knowledge', 'Maths', 'Sport & Leisure'], {
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
        if (data.type === 'player') {
          Team.getByTeamAndGame(data.team, data.game, function (team) {
            team.setSocketId(socket.id);
            team.save();
          });
          socket.broadcast.emit('new-team', {
            team: data.team
          });
          socket.join('players');
        }
        if (data.type === 'presenter') {
          socket.join('presenters');
        }
        if (data.type === 'admin') {
          socket.join('admins');
        }
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
        getNextCategory();
      });

      socket.on('send-answer', function (data) {
        Game.getByName(game.getName(), function (retreivedGame) {
          game = retreivedGame;
          game.storeTeamAnswer(
            socket.id,
            data.answer,
            quiz.getQuestionId(),
            function (allTeamsAnswered) {
              if (allTeamsAnswered) {
                clearInterval(countdownInterval);
                getNextQuestion();
              } else {
                socket.emit('show-wait');
              }
          });
        });
      });
    });

    function getNextQuestion () {
      var state = quiz.getNextQuestion(function (question) {
        app.render('game/player/question', {
          layout: false,
          answers: question.getOptions(),
          question: question.getQuestion()
        }, function (err, html) {
          if (err) {
            console.log(err);
          }
          nsp.to('players').emit('page', {
            html: html
          });
        });

        app.render('game/presenter/question', {
          layout: false,
          answers: question.getOptions(),
          question: question.getQuestion()
        }, function (err, html) {
          if (err) {
            console.log(err);
          }
          nsp.to('presenters').emit('page', {
            html: html
          });
        });

        questionSeconds = quiz.getQuestionTimeByDifficulty(question.getDifficulty());
        secondsLeft = questionSeconds;

        countdownInterval = setInterval(function () {
          if (isPaused) {
            return;
          }
          secondsLeft--;
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

      if (state === 'EndQuiz') {
        app.render('game/player/results', {
          layout: false
        }, function (err, html) {
          if (err) {
            console.log(err);
          }
          nsp.to('players').emit('page', {
            html: html
          });
        });

        app.render('game/presenter/results', {
          layout: false
        }, function (err, html) {
          if (err) {
            console.log(err);
          }
          nsp.to('presenters').emit('page', {
            html: html
          });
        });
      }
      if (state === 'EndCategory') {
        getNextCategory();
      }
    }

    function getNextCategory () {
      quiz.getNextCategory();

      app.render('game/player/category', {
        layout: false,
        category: quiz.getCurrentCategory()
      }, function (err, html) {
        if (err) {
          console.log(err);
        }
        nsp.to('players').emit('page', {
          html: html
        });
      });

      app.render('game/presenter/category', {
        layout: false,
        category: quiz.getCurrentCategory()
      }, function (err, html) {
        if (err) {
          console.log(err);
        }
        nsp.to('presenters').emit('page', {
          html: html
        });
      });

      setTimeout(function () {
        getNextQuestion();
      }, 5000);
    }
  };

  this.startWebSockets();
}

module.exports = Lobby;

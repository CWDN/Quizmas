var server = require('../server');
var io = server.io;
var app = server.app;
var Team = require('../database/models/Team');
var Quiz = require('../quiz');
var Game = require('../database/models/Game');
var Question = require('../database/models/Question');

function Lobby (game) {
  this.game = game;

  this.startWebSockets = function () {
    var nsp = io.of('/' + this.game.getName());
    var quiz = new Quiz(['General Knowledge'], {
      hard: 0,
      medium: 0,
      easy: 1
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
            socket.broadcast.emit('new-team', {
              team: team.getName(),
              socketId: team.getSocketId()
            });
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
            team: team.getName(),
            socketId: team.getSocketId()
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
          Question.getByQuestionId(quiz.getQuestionId(), function (question) {
            game.storeTeamAnswer(
              socket.id,
              data.answer,
              quiz.getQuestionId(),
              question.correctAnswer === data.answer,
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

        nsp.to('admins').emit('team-answered', {socketId: socket.id});
      });

      socket.on('pause', function (data) {
        isPaused = data.pause;

        if (isPaused) {
          nsp.to('admins').emit('paused', {});
        } else {
          nsp.to('admins').emit('resume', {});
        }
      });

      socket.on('unlock', function (data) {
        Team.getBySocketId(data.socketId, function (team) {
          if (team === undefined) {
            return;
          }
          team.removeAnswerForQuestion(quiz.getQuestionId());
        });

        nsp.to(data.socketId).emit('unlock');
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

        nsp.to('admins').emit('question', {
          question: question.getQuestion()
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
        Question.getQuestions(quiz.getUsedQuestions(), function (questions) {
          var teams = game.getTeams();
          sendPlayerResults(questions, teams);

          Team.getTotalCorrectAnswersForTeamsAndGame(
            game.getTeams(),
            game.getName(),
            function (answerCounts) {
              var teams = [];
              for (var teamIndex = 0; teamIndex < answerCounts.length; teamIndex++) {
                var team = answerCounts[teamIndex];
                var teamName = Object.keys(team)[0];
                teams.push({
                  team: teamName,
                  count: team[teamName]
                });
              }
              var totalQuestions = quiz.getUsedQuestions().length;

              app.render('game/presenter/results', {
                layout: false,
                teams: teams,
                totalQuestions: totalQuestions
              }, function (err, html) {
                if (err) {
                  console.log('ERROR RENDERING');
                  console.log(err);
                }
                nsp.to('presenters').emit('page', {
                  html: html
                });
              });
            }
          );
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

    function sendPlayerResults (questions, teams) {
      for (var index = 0; index < teams.length; index++) {
        var team = teams[index];
        Team.getAnswersForTeamQuestionIdsAndGame(
          team.name,
          quiz.getUsedQuestions(),
          game.getName(),
          function (answers) {
            var totalCorrect = 0;
            var formattedAnswers = [];
            for (var questionIndex = 0; questionIndex < questions.length; questionIndex++) {
              var question = questions[questionIndex];
              var answer = {
                question: question.question,
                answer: '',
                correctAnswer: '',
                correct: false
              };
              for (var answerIndex = 0; answerIndex < answers.length; answerIndex++) {
                if (question.id === answers[answerIndex].questionId) {
                  answer.answer = answers[answerIndex].answer;
                  answer.correctAnswer = question.correctAnswer;
                  if (answers[answerIndex].correct) {
                    answer.correct = true;
                    totalCorrect++;
                  }
                }
              }
              formattedAnswers.push(answer);
            }
            app.render('game/player/results', {
              layout: false,
              answers: formattedAnswers,
              totalCorrect: totalCorrect,
              totalQuestions: questions.length
            }, function (err, html) {
              if (err) {
                console.log(err);
              }
              nsp.to(team.socketId).emit('page', {
                html: html
              });
            });
          }
        );
      }
    }
  };

  this.startWebSockets();
}

module.exports = Lobby;

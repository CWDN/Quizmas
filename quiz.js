var Question = require('./database/models/Question');

function Quiz (categories, difficulties, game) {
  this.usedQuestions = [];
  this.categories = categories.shuffle();
  this.totalHard = difficulties.hard;
  this.totalMedium = difficulties.medium;
  this.totalEasy = difficulties.easy;
  this.game = game;
  this.currentCategory = this.categories.shift();
  this.currentQuestionId = 0;
  this.currentHard = 0;
  this.currentMedium = 0;
  this.currentEasy = 0;

  this.getNextQuestionByDifficulty = function (difficulty, callback) {
    var quiz = this;
    Question.getOneByCategoryAndDifficultyButExcluding(
      this.getCurrentCategory(),
      difficulty,
      this.usedQuestions,
      function (question) {
        if (question === undefined) {
          return;
        }
        quiz.usedQuestions.push(question.getId());
        quiz.currentQuestionId = question.getId();
        callback(question);
      }
    );
  };
}

Quiz.prototype.getNextQuestion = function (callback) {
  var difficulty = '';
  if (this.currentEasy < this.totalEasy) {
    this.currentEasy++;
    difficulty = 'Easy';
  } else if (this.currentMedium < this.totalMedium) {
    this.currentMedium++;
    difficulty = 'Medium';
  } else if (this.currentHard < this.totalHard) {
    this.currentHard++;
    difficulty = 'Hard';
  }

  if (difficulty === '') {
    // If no more questions or categories then end quiz.
    if (this.categories.length === 0) {
      return 'EndQuiz';
    // If no more questions but still more categories then end of category.
    } else {
      return 'EndCategory';
    }
  }
  this.getNextQuestionByDifficulty(difficulty, callback);
};

Quiz.prototype.getQuestionId = function () {
  return this.currentQuestionId;
};

Quiz.prototype.getCurrentCategory = function () {
  return this.currentCategory;
};

Quiz.prototype.getNextCategory = function () {
  if (this.categories.length > 0) {
    this.currentCategory = this.categories.shift();
  }
  this.currentHard = 0;
  this.currentMedium = 0;
  this.currentEasy = 0;

  return this.getCurrentCategory();
};

module.exports = Quiz;

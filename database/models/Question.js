var sqlite3 = require('sqlite3').verbose();

/**
 * Constructor.
 */
function Question () {
  this.id = 0;
  this.question = '';
  this.options = [];
  this.correctAnswer = '';
  this.difficulty = '';
  this.category = '';
}

Question.prototype.getId = function () {
  return this.id;
};

/**
 * Gets the question of the game.
 * @return {string}
 */
Question.prototype.getQuestion = function () {
  return this.question;
};

Question.prototype.getOptions = function () {
  return this.options.shuffle();
};

Question.prototype.getCorrectAnswer = function () {
  return this.correctAnswer;
};

Question.prototype.getDifficulty = function () {
  return this.difficulty;
};

Question.prototype.getCategory = function () {
  return this.category;
};

/**
 * Imports the data from the given object into this question object.
 * @param  {Object} object
 */
Question.prototype.importFromObject = function (object) {
  if (object.question !== undefined) {
    this.id = object.id;
    this.question = object.question;
    this.options = JSON.parse(object.options);
    this.correctAnswer = object.correctAnswer;
    this.difficulty = object.difficulty;
    this.category = object.category;
  }
  return this;
};

Question.getByQuestion = function (question, callback) {
  var db = getDBConnection();
  var result;
  db.serialize(function () {
    var stmt = db.prepare('SELECT * FROM questions WHERE question=?');
    stmt.run(question);
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
      var questionObj = new Question();
      questionObj.importFromObject(result);
      callback(questionObj);
    });
  });
};

Question.getByCategory = function (category, callback) {
  var db = getDBConnection();
  var result;
  db.serialize(function () {
    var stmt = db.prepare('SELECT * FROM questions WHERE category=?');
    stmt.all(category, function (err, res) {
      if (err) throw err;
      result = res;
    });
    stmt.finalize(function () {
      db.close();
      if (result.length === 0) {
        callback([]);
        return;
      }
      var questionObjects = result.map(function (item) {
        var questionObj = new Question();
        return questionObj.importFromObject(item);
      });
      callback(questionObjects);
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

module.exports = Question;

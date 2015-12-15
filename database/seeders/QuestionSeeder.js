var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database/quiz.sqlite');
var fs = require('fs');
console.log('Seeding questions');

db.serialize(function () {
  db.run('begin transaction');
  var stmt = db.prepare('INSERT INTO questions (question, options, correctAnswer, difficulty, category) VALUES (?, ?, ?, ?, ?)');
  var questionsString = fs.readFileSync(__dirname + '/data/multi-choice.json').toString();
  var categories = JSON.parse(questionsString);
  for (var category in categories) {
    var questions = categories[category];
    for (var index in questions) {
      var question = questions[index];
      stmt.run([
        question.question + '?',
        JSON.stringify(question.answers),
        question.correctAnswer,
        question.difficulty,
        category
      ]);
    }
  }
  stmt.finalize();
  db.run('commit');
});

db.close();

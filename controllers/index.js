var express = require('express');
var router = express.Router();

router.use('/game', require('./game'));

router.get('/', function (req, res) {
  return res.render('home');
});

router.get('/question', function (req, res) {
  return res.render('question');
});

module.exports = router;

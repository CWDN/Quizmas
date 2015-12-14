var express = require('express');
var router = express.Router();
var Game = require('../database/models/Game');

router.post('/create', function (req, res) {
  if (req.body.game === '') {
    return res.redirect('back');
  }

  var game = new Game();
  game.setName(req.body.game);
  game.create();
  return res.render('game/create');
});

router.post('/join', function (req, res) {
  return res.render('home', {layout: false});
});

router.get('/:game/lobby', function (req, res) {
  console.log(req.params);

  return res.render('home', {layout: false});
});

module.exports = router;

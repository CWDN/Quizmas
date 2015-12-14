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
  return res.render('game/lobby', {game: game.getName()});
});

router.post('/join', function (req, res) {
  return res.redirect('/game/' + req.body.game + '/lobby');
});

router.get('/:game/lobby', function (req, res) {
  var game = Game.getByName(req.params.game);
  if (game === undefined) {
    return res.redirect('/');
  }

  return res.render('game/lobby', {game: game.getName()});
});

module.exports = router;

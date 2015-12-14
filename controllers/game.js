var express = require('express');
var router = express.Router();
var Game = require('../database/models/Game');
var Lobby = require('./lobby-ws');

router.post('/create', function (req, res) {
  if (req.body.game === '') {
    return res.redirect('back');
  }

  var game = new Game();
  game.setName(req.body.game);
  game.create();
  new Lobby(game);
  return res.render('game/presenter-lobby', {game: game.getName()});
});

router.post('/join', function (req, res) {
  var game = Game.getByName(req.body.game);
  if (game === undefined) {
    return res.redirect('/');
  }
  return res.render('game/team-name', {game: game.getName()});
});

router.post('/:game/lobby', function (req, res) {
  var game = Game.getByName(req.params.game);
  if (game === undefined) {
    return res.redirect('/');
  }
  game.addTeam(req.body.teamName);

  return res.render('game/player-lobby', {
    game: game.getName(),
    teams: game.getTeams(),
    currentTeam: req.body.teamName
  });
});

router.get('/:game/lobby/presenter', function (req, res) {
  var game = Game.getByName(req.params.game);
  if (game === undefined) {
    return res.redirect('/');
  }

  return res.render('game/presenter-lobby', {
    game: game.getName(),
    teams: game.getTeams()
  });
});

module.exports = router;

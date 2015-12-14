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
  Game.getByName(req.body.game, function (game) {
    if (game === undefined) {
      res.redirect('/');
      return;
    }
    res.render('game/team-name', {game: game.getName()}, function (err, html) {
      if (err) {
        console.log(err);
      }
      res.send(html);
    });
  });
});

router.post('/:game/lobby', function (req, res) {
  Game.getByName(req.params.game, function (game) {
    if (game === undefined) {
      res.redirect('/');
      return;
    }
    game.addTeam(req.body.teamName);

    res.render('game/player-lobby', {
      game: game.getName(),
      teams: game.getTeams(),
      currentTeam: req.body.teamName
    }, function (err, html) {
      if (err) {
        console.log(err);
      }
      res.send(html);
    });
  });
});

router.get('/:game/lobby/presenter', function (req, res) {
  Game.getByName(req.params.game, function (game) {
    if (game === undefined) {
      res.redirect('/');
      return;
    }
    res.render('game/presenter-lobby', {
      game: game.getName(),
      teams: game.getTeams()
    }, function (err, html) {
      if (err) {
        console.log(err);
      }
      res.send(html);
    });
  });
});

module.exports = router;

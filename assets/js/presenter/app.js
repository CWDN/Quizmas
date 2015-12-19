/* global $, teamName, game */
$(document).ready(function () {
  Socket.emit('join', {
    game: game,
    type: 'presenter'
  });

  Socket.on('new-team', function (data) {
    var team = data.team;
    $('.player-list').append('<li>' + team + '</li>');
  });

  Socket.on('remove-team', function (data) {
    var team = data.team;
    $('.player-list li').each(function () {
      if (team === $(this).html().trim()) {
        $(this).remove();
      }
    });
  });

  Socket.on('page', function (data) {
    $('[data-container]').html(data.html);
  });
});

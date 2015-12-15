/* global $, teamName, game */
$(document).ready(function () {
  Socket.emit('join', {
    game: game,
    type: 'presenter'
  });

  Socket.on('page', function (data) {
    $('[data-container]').html(data.html);
  });
});

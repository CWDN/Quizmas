/* global $, game */
$(document).ready(function () {
  Socket.emit('join', {
    game: game,
    type: 'admin'
  });

  $('[data-quiz-event="start"]').click(function () {
    Socket.emit('next-question');
  });
});

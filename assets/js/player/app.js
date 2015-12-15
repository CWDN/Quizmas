/* global $, teamName, game */
$(document).ready(function () {
  if (typeof teamName !== 'undefined') {
    Socket.emit('join', {
      game: game,
      team: teamName,
      type: 'player'
    });
  }

  $(document).on('click', '[data-send-answer]', function () {
    var $selected = $('.answer input[type="radio"]:checked');
    var answer = $selected.val();
    Socket.emit('send-answer', {
      answer: answer
    });
  });

  Socket.on('show-wait', function () {
    $('.overlay').removeClass('hide');
  });

  Socket.on('page', function (data) {
    $('[data-container]').html(data.html);
  });
});

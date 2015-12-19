/* global $, teamName, game */
$(document).ready(function () {
  if (typeof teamName !== 'undefined') {
    Socket.emit('join', {
      game: game,
      team: teamName,
      type: 'player'
    });
  }
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

  Socket.on('unlock', function (data) {
    $('.overlay').addClass('hide');
  });
});

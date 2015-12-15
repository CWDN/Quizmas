/* global $, game, io, location, teamName */
$(document).ready(function () {
  $('.next-question').click(function () {
    $('.overlay').removeClass('hide');
    var timeLeft = 3;
    $('[data-countdown]').html(timeLeft + 's');
    var intervalId = setInterval(function () {
      timeLeft--;
      $('[data-countdown]').html(timeLeft + 's');
      if (timeLeft < 1) {
        clearInterval(intervalId);
        $('.overlay').addClass('hide');
      }
    }, 1000);
  });

  console.log('GAME:' + game);
  var Socket = io.connect(location.origin + '/' + game, {path: '/socket.io'});
  if (typeof teamName !== 'undefined') {
    Socket.emit('join', {
      game: game,
      team: teamName
    });
  }

  $('[data-quiz-event="start"]').click(function () {
    Socket.emit('start');
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

  Socket.on('start', function (data) {
    alert('The quiz has started!');
  });
});

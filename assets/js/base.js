/* global $, game, io, location */
var Socket;
$(document).ready(function () {
  Socket = io.connect(location.origin + '/' + game, {path: '/socket.io'});
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

  Socket.on('countdown-reduce', function (data) {
    var percentage = ((data.secondsLeft / data.questionSeconds) * 100) + '%';
    $('[data-timer]').css('width', percentage);
    $('[data-countdown]').html(data.secondsLeft + 's');
  });
});

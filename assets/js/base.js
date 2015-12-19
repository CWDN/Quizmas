/* global $, game, io, location */
var Socket;
$(document).ready(function () {
  Socket = io.connect(location.origin + '/' + game, {path: '/socket.io'});

  Socket.on('countdown-reduce', function (data) {
    var percentage = ((data.secondsLeft / data.questionSeconds) * 100) + '%';
    $('[data-timer]').css('width', percentage);
    $('[data-countdown]').html(data.secondsLeft + 's');
  });
});

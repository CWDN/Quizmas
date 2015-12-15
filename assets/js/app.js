/* global $, game, io, location, teamName */
$(document).ready(function () {
  console.log('GAME:' + game);
  var Socket = io.connect(location.origin + '/' + game, {path: '/socket.io'});
  if (typeof teamName !== 'undefined') {
    Socket.emit('join', {
      game: game,
      team: teamName
    });
  }

  $('[data-quiz-event="start"]').click(function () {
    Socket.emit('next-question');
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

  Socket.on('countdown-reduce', function (data) {
    var percentage = ((data.secondsLeft / data.totalSeconds) * 100) + '%';
    $('[data-timer]').css('width', percentage);
  });

  $(document).on('click', '[data-send-answer]', function () {
    var $selected = $('.answer input[type="radio"]:checked');
    console.log($selected);
    if (!$selected) {
      alert('select something!');
      return;
    }

    var answer = $selected.val();
    Socket.emit('send-answer', {
      answer: answer
    });
  });
});

/* global $, game */
var pause = true;
$(document).ready(function () {
  Socket.emit('join', {
    game: game,
    type: 'admin'
  });


  $('[data-quiz-event="start"]').click(function () {
    Socket.emit('next-question');
    $(this).addClass('hide');
    $('[data-quiz="initialhide"]').removeClass('hide');
  });

  $('[data-quiz-event="pause-quiz"]').click(function () {
    Socket.emit('pause', {pause: pause});
  });

  Socket.on('new-team', function (data) {
    var templateHtml = $('template#team-item').html();
    var updatedHtml = templateHtml.replace('{SOCKETID}', data.socketId);
    updatedHtml = updatedHtml.replace('{TEAMNAME}', data.team);
    $('.team-list').append(updatedHtml);
  });

  Socket.on('remove-team', function (data) {
    console.log('remove team');
    console.log(data);
    $('[data-quiz-socketid="' + data.socketId + '"]').remove();
  });

  Socket.on('remove-team', function (data) {
    console.log('remove team');
    console.log(data);
    $('[data-quiz-socketid="' + data.socketId + '"]').remove();
  });

  Socket.on('paused', function () {
    $('[data-quiz-event="pause-quiz"]').html('Resume');
    pause = false;
  });

  Socket.on('resume', function () {
    $('[data-quiz-event="pause-quiz"]').html('Pause');
    pause = true;
  });

  Socket.on('question', function (data) {
    $('[data-quiz="current-question"] h3').html(data.question);
  });
});

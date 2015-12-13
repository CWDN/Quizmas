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
});

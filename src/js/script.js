$(document).ready(function () {
    $('.slider-one__list').bxSlider({});
});

$(document).ready(function () {
  $('.slider-two__list').bxSlider({});
});


// dropdown

$('.footer__inf-mobile').on('click', e => {
  e.preventDefault()

  const dropDown = $('.dropdown')

  dropDown.addClass('dropdown__active');
});

$('.dropdown__close').on('click', e => {
  e.preventDefault()

  const dropDown = $('.dropdown')

  dropDown.removeClass('dropdown__active');
});
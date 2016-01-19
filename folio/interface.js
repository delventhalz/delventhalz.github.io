var plays = [
  {value: "Hamlet", path: "hamlet.html"},
  {value: "Twelfth Night", path: "twelfth_night.html"},
  {value: "Winter's Tale", path: "winters_tale.html"}
];

// $('.formatting').attr('href', 'styles/default.css');

// Button Toggle Behavior
$('.toggle').on('click', function() {
  $(this).toggleClass('active');
});

$('.radio-toggle').on('click', function() {
  $(this).toggleClass('active');
  $(this).removeClass('active');
});


$('#play_selection').autocomplete({
    lookup: plays,
    onSelect: function (suggestion) {
      $('.content').children().remove();
      $.get(suggestion.path, function(data) {
        $('.content').append(data);
      });
    }
});

$('#font_smaller').on('click', function() {
  var fontSize = $('.folio').css('font-size').slice(0, -2);
  $('.folio').css('font-size', fontSize - 1);
});

$('#font_larger').on('click', function() {
  var fontSize = $('.folio').css('font-size').slice(0, -2);
  fontSize++; // No idea why, but fontSize must be incremented seperately.
  $('.folio').css('font-size', fontSize);
});

$('#character_linebreak').on('click', function() {
  toggleStyle('#char_lb_style', '.character', 'display', 'block', 'inline');
});

var toggleStyle = function (id, selector, style, on, off) {
  console.log($(id).length);
  if (!$(id).length) {
    $('head').append('<style id="' + id.slice(1) + '" type="text/css"></style>');
  }
  if ($(selector).css(style) === on) {
    $(id).html(selector + '{' + style + ':' + off + ';}');
  } else {
    $(id).html(selector + '{' + style + ':' + on + ';}');
  }
};

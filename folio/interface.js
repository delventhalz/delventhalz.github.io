var plays = [
  {value: "Hamlet", path: "hamlet.html"},
  {value: "Twelfth Night", path: "twelfth_night.html"},
  {value: "Winter's Tale", path: "winters_tale.html"}
];

// $('.formatting').attr('href', 'styles/modern.css');

// Adds a style tag to the head if it does not exist.
var makeStyleTag = function (selector) {
  var type;

  if (!$(selector).length) {
    if (selector[0] === '.') type = 'class';
    else if (selector[0] === '#') type = 'id';
    else return;

    $('head').append('<style ' + type + '="' + selector.slice(1) 
      + '" type="text/css"></style>');
  }
};

// Toggles a particular CSS style on or off in the whole document. 
// Note that an off state must be provided in order to override existing styles.
var toggleStyle = function (selector, style, on, off) {
  var id = '#' + selector.replace('.', '').replace('#', '') + '-' + style;
  makeStyleTag(id);

  if ($(selector).css(style) === on) {
    $(id).html(selector + '{' + style + ':' + off + ';}');
  } else {
    $(id).html(selector + '{' + style + ':' + on + ';}');
  }
};

var toggleSizeStyle = function (selector, style, size) {
  var id = '#' + selector.replace('.', '').replace('#', '') + '-' + style;
  makeStyleTag(id);

  if ( $(selector).css(style).replace('px', '') > 0 ) {
    $(id).html(selector + '{' + style + ':0;}');
  } else {
    $(id).html(selector + '{' + style + ':' + size + ';}');
  }
};


// General Button Toggle Behavior
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

// Behaviors for the formatting buttons on the third row.
$('#font_smaller').on('click', function() {
  var fontSize = $('.folio').css('font-size').slice(0, -2);
  $('.folio').css('font-size', fontSize - 1);
});

$('#font_larger').on('click', function() {
  var fontSize = $('.folio').css('font-size').slice(0, -2);
  fontSize++; // No idea why, but fontSize must be incremented seperately.
  $('.folio').css('font-size', fontSize);
});

$('#line_spacing').on('click', 'li', function() {
  $('.folio').css( 'line-height', ($(this).text() * 100) + '%' );
});

$('#character_linebreak').on('click', function() {
  toggleStyle('.character', 'display', 'block', 'inline');
  toggleStyle('.char-stop', 'display', 'none', 'inline');
});

$('#character_caps').on('click', function() {
  toggleStyle('.character', 'text-transform', 'uppercase', 'none');
});

$('#character_bold').on('click', function() {
  toggleStyle('.character', 'font-weight', '800', '300');
});

$('#direction_linebreak').on('click', function() {
  toggleStyle('.direction', 'display', 'block', 'inline');
});

// TODO: Make dynamic with line-height is changed afterwards.
$('#paragraph_linebreak').on('click', function() {
  var height = $('.folio').css('line-height').replace('px', '');
  toggleSizeStyle('p', 'margin-top', height * 0.5 + 'px');
});

$('#punctuation_whitespace').on('click', function() {
  toggleSizeStyle('.major', 'margin-right', '1.5em');
});

// TODO: Make major punctuation bigger as well;
$('#punctuation_bold').on('click', function() {
  toggleStyle('.major', 'font-weight', '800', '300');
  toggleStyle('.minor', 'font-weight', '800', '300');
});

$('#line_numbers').on('click', function() {
  toggleStyle('.line-count', 'display', 'none', 'inline');
});

$('#syllable_numbers').on('click', function() {
  toggleStyle('.syllable-count', 'display', 'none', 'inline');
});
/* * * * * * * * * * * * * * * * 
 *      GLOBAL VARIABLES       *
 * * * * * * * * * * * * * * * */

var settings = {
  interval: 3000,
  timestampInterval: 5000,
  slideSpeed: 300
};

var state = {
  refreshing: true,
  paused: true,
  overlayUser: ''
};

var index = {
  main: 0,
  overlay: 0
};

// Global timer object prevents multiple timers being created
var timer = {};

// Couldn't figure out how to properly initialize visitor until I examined 
// Rokas's code and discovered that I needed to set a string AND add a new 
// array in streams.users with that string as the key (the part I was missing).
visitor = 'you';
streams.users[visitor] = [];


/* * * * * * * * * * * * * * * * 
 *      HELPER FUNCTIONS       *
 * * * * * * * * * * * * * * * */

// Immediately prints all tweetles before resuming regular refreshes
var fillTweetles = function(user) {
  if (user) {
    while (index.overlay < streams.users[user].length) {
      printTweetle(user);
    }
  } else {
    while (index.main < streams.home.length) {
      printTweetle();
    }
  }
  
  refreshTweetles(user);
};

// If refreshing, prints any new tweetles on each interval
var refreshTweetles = function(user) {
  if (user) {
    if (state.refreshing &&  index.overlay < streams.users[user].length) {
      printTweetle(user);
    }
    timer.overlay = setTimeout(function() {refreshTweetles(user)}, settings.interval);
  } else {
    if (state.refreshing && index.main < streams.home.length) {
      printTweetle();
    }
    timer.main = setTimeout(refreshTweetles, settings.interval);
  }
};

// Prints a single tweetle to the appropriate place in the DOM
var printTweetle = function(user) {
  var $tweetle = buildTweetle(user);

  if (user) {
    $tweetle.prependTo($('.second-feed'));
    $('.second-feed').find('.tweetle').slideDown(settings.slideSpeed);
    index.overlay++;
  } else {
    $tweetle.prependTo($('.feed'));
    $('.feed').find('.tweetle').slideDown(settings.slideSpeed);
    index.main++;
  }
}

// Returns a jQuery object with a tweetle's HTML
var buildTweetle = function(user) {
  var tweetle = user ? streams.users[user][index.overlay] : streams.home[index.main];
  var $tweetle = $('<div class="tweetle">' +
    '<h6 class="timestamp clearfix" data-utc="' + tweetle.created_at + '">' + moment(tweetle.created_at).fromNow() + '</h6>' +
    '<h4 class="username">@' + tweetle.user + '</h4>' +
    '<p class ="message">' + tweetle.message + '</p></div>');
  
  return $tweetle;
}

// Refreshes the timestamp on all tweetles
var refreshTimestamp = function() {
  $('.feed').find('.timestamp').each(function() {
    var utcTime = $(this).data("utc");
    $(this).text(moment(utcTime).fromNow());
  });
  
  $('.second-feed').find('.timestamp').each(function() {
    var utcTime = $(this).data("utc");
    $(this).text(moment(utcTime).fromNow());
  });
  
  setTimeout(refreshTimestamp, settings.timestampInterval);
}


/* * * * * * * * * * * * * * * * 
 *    RUNTIME AND LISTENERS    *
 * * * * * * * * * * * * * * * */

$(document).ready(function(){
  
  // Toggle tweetle refreshing
  $('.refresh').on('click', function() {
    state.refreshing = !state.refreshing;
    
    if (state.refreshing){
      $(this).text('Stop Refresh');
      fillTweetles();
    } else {
      $(this).text('Refresh');
    }
  });
  
  // Send a new tweetle
  $('.send').on('click', function() {
    var message = $('.user-message').val();
    if (message.length > 0) {
      writeTweet(message);
      $('.user-message').val('');
    }
    
    // Makes a new tweet appear, even when refresh is off
    if (state.refreshing) {
      printTweetle();
    } else {
      state.refreshing = true;
      fillTweetles();
      state.refreshing = false;
    }
  });
  
  // Reveal overlay for specific user's tweets. Thanks to Travis for
  // pointing out that I needed to use a static parent element here
  $('.feed').on('click', '.username', function() {
    var user = $(this).text().slice(1);
    
    $('.second-heading').text("@" + user + "'s tweetles");
    $('.second-feed').children().remove();
    $('.secondary').slideDown(settings.slideSpeed);

    index.overlay = 0;
    fillTweetles(user);
  });
  
  $('.hide').on('click', function() {
    $('.secondary').slideUp(settings.slideSpeed);
  });
  
  // Pause main tweeter refresh on mouseover
  $('.feed').on('mouseenter', '.tweetle', function() {
    if(state.refreshing) {
      state.refreshing = false;
      state.paused = true;
    }
  });
  
  $('.feed').on('mouseleave', '.tweetle', function() {
    if (state.paused) {
      state.refreshing = true;
      state.paused = false;
      fillTweetles();
    }
  });
  
  // Begin loading tweetles
  fillTweetles();
  refreshTimestamp();
});
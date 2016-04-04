$(document).ready(function(){
  var printed = 0; //the most recent main tweetle index to have been printed
  var userPrinted = 0; //counts the tweetle index of the currently displayed user
  var refresh = true; //whether or not the user wishes to see new tweetles
  var paused = false; //whether a mouse hover is currently being used to pause refreshes
  var user = ""; //current user in the overlay
  
  //global timer objects prevent bug caused by multiple timers being created
  var timer = undefined; 
  var overlayTimer = undefined;
  
  //I couldn't figure out how to properly initialize visitor, and after a number of tries
  //I examined Rokas's code and discovered that I needed to set a string AND initialize add that
  //a new array in streams.users with that string as the key (the part I was missing).
  visitor = "you";
  streams.users[visitor] = [];
  
  
  //returns the jQuery object for a tweetle's HTML
  var createTweetle = function(index, user) {
    var tweetle = user ? streams.users[user][index] : streams.home[index];
    var $tweetle = $('<div class="tweetle">' +
            '<h6 class="timestamp clearfix" data-utc="' + tweetle.created_at + '">' + moment(tweetle.created_at).fromNow() + '</h6>' +
            '<h4 class="username">@' + tweetle.user + '</h4>' +
            '<p class ="message">' + tweetle.message + '</p></div>');
    
    return $tweetle;
  }
  
  //prints a single tweetle to the appropriate place in the DOM
  var printTweetle = function(keyword) {
    if (keyword === 'overlay') {
      var $tweetle = createTweetle(userPrinted, user);
      $tweetle.prependTo($('.second-feed'));
      $('.second-feed').find('.tweetle').slideDown(300);
      userPrinted++;
    } else {
      var $tweetle = createTweetle(printed);
      $tweetle.prependTo($('.feed'));
      $('.feed').find('.tweetle').slideDown(300);
      printed++;
    }
  }
  
  //prints tweetles every half second if refresh is true and there are tweetles to print
  var refreshTweetles = function(keyword) {
    if (keyword === 'overlay') {
      if (refresh &&  userPrinted <= streams.users[user].length - 1) {
        printTweetle(keyword);
      }
      overlayTimer = setTimeout(function() {refreshTweetles(keyword)}, 500);
    } else {
      if (refresh && printed <= streams.home.length -1) {
        printTweetle();
      }
      timer = setTimeout(function() {refreshTweetles()}, 500);
    }
  };
  
  //immediately prints all unprinted tweetles before resuming regular refreshes
  var fillTweetles = function(keyword) {  
    if (keyword === 'overlay') {
      while (userPrinted <= streams.users[user].length - 1) {
        printTweetle(keyword);
      }
    } else {
      while (printed <= streams.home.length - 1) {
        printTweetle();
      }
    }
    
    refreshTweetles(keyword);
  }
  
  //refreshes the timestamp on every tweetle every second
  var refreshTime = function() {
    $('.feed').find('.timestamp').each(function() {
      var utcTime = $(this).data("utc");
      $(this).text(moment(utcTime).fromNow());
    });
    
    $('.second-feed').find('.timestamp').each(function() {
      var utcTime = $(this).data("utc");
      $(this).text(moment(utcTime).fromNow());
    });
    
    setTimeout(refreshTime, 1000);
  }
  
  //allows the user to toggle tweetle refreshing
  $('.refresh').on('click', function() {
    refresh = !refresh;
    
    if (refresh){
      $(this).text('Stop Refresh');
      fillTweetles();
    } else {
      $(this).text('Refresh');
    }
  });
  
  //allows the user to send their own tweetle
  $('.send').on('click', function() {
    var messageBox = $(this).closest('.input').find('.user-message');
    var message = messageBox.val();
    if (message.length > 0) {
      writeTweet(message);
    }
    messageBox.val('');
    
    //makes written tweets immediately appear, regardless of whether refresh is on
    if (refresh) {
      printTweetle();
    } else {
      refresh = true;
      fillTweetles();
      refresh = false;
    }
  });
  
  //allows user to select individual usernames
  //special thanks to Travis for pointing out that I needed to call a static parent element here
  $('.feed').on('click', '.username', function() {
    user = $(this).text().slice(1);
    
    $('.second-heading').text("@" + user + "'s tweetles");
    $('.second-feed').children().remove();
    $('.secondary').slideDown(300);

    userPrinted = 0;
    fillTweetles('overlay');
  });
  
  $('.hide').on('click', function() {
    $(this).closest('.secondary').slideUp(300);
  });
  
  //main feed tweetle refresh will pause on mouseover to allow for easier interaction
  $('.feed').on('mouseenter', '.tweetle', function() {
    if(refresh) {
      refresh = false;
      paused = true;
    }
  });
  
  $('.feed').on('mouseleave', '.tweetle', function() {
    if (paused) {
      refresh = true;
      paused = false;
      fillTweetles();
    }
  });
  
  //initial call to begin loading tweetles and refreshing time
  fillTweetles();
  refreshTime();
});
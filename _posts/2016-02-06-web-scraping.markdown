---
layout: post
title:  "Scraping the Web for Fun and Profit"
date:   2016-03-06 18:30:00 -0600
categories: javascript
---
So you and your team have been talking about your new social web app. Development has been going well, and someone had the bright idea: "Hey, we should automatically populate some information from the links our users share. Maybe pull in an image or two too!"

Now *you* have to build a web scraper. How hard could it be?

Don't you worry friend. We'll do it together.

### Make the Client Do the Work

Web scraping is not terribly resource intensive, but maybe you're dreaming big and want to do a live scrape for every link anytime one of your users looks at it. No problem, add it to the client code and keep the extra load off your server!

Yeah . . . no. Unfortunately, because of browsers' [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy), it is not possible for the client to fetch html from anywhere but your own server (or other servers that have explictly whitelisted it ahead of time). In order to avoid using your own server, you're basically going to have to [hook into some proxy service](http://stackoverflow.com/questions/15005500/loading-cross-domain-html-page-with-ajax), which really isn't helping anything.

So let's just build the scraper on our own server.

### Your Tools

Your going to want to head over to your console and `npm install` [request](https://github.com/request/request) and [cheerio](https://github.com/cheeriojs/cheerio).

**Request** is the standard for server-side http requests. It makes it dead simple to send GET, POST or whatever requests to whereever you want. Even better, install [request-promise](https://github.com/request/request-promise) instead of request, to get all that request goodness with some clean and clear [Bluebird](http://bluebirdjs.com/docs/getting-started.html) promises baked in.

Meanwhile, **Cheerio** is a server-side implementation of [jQuery](https://jquery.com). You are going to be parsing through some html files in a second, and you are *definitely* going to want access to jQuery syntax when you do it.

### Fetching the HTML

Using `request-promise` to get the html you want couldn't be simpler:

{% highlight javascript %}
var request = require('request-promise');

request(url)
.then(function (html) {
  scrape(html);
});
{% endhighlight %}

That's it. So now that we have html, what do we do with it? What goes into that little `scrape` function there?

### Cheerio And You

Cheerio requires a little bit of extra setup. After `require`ing it normally, you use the `load` method to create a jQuery-like `$` object with all of the HTML you're planning to scrape. So, if your goal was just to return the `title` of a webpage we, you code might look something like this:

{% highlight javascript %}
var cheerio = require('cheerio');

var scrape = function(html) {
  var $ = cheerio.load(html);

  return $('title').text();
};
{% endhighlight %}

Once properly loaded, cheerio works identically to jQuery, giving you access to all the same selectors and methods you would normally have on the front-end. So now that you have all of this power, what do you do with it?

### `meta` Is So Meta

There's a good chance that whatever information you wanted to scrape can be found in a site's *metadata*. With the rise of social networks, most webpages are hoping to be shared, liked, tweeted, upvoted, pinned, or übermensched. Enter the `meta` tag. Designed to contain information about a site's title, subject matter, authorship, and more, these tags are left in the `head` of a page for an enterprising social media gurus like yourself (and Facebook, mostly Facebook). For example, here's an edited sample from the source for a [Udemy](https://www.udemy.com/) course:

{% highlight html %}
<head>
  <title>Advanced React and Redux | Udemy</title>

  <meta name="title" content="Advanced React and Redux - Udemy">
  <meta property="udemy_com:category" content="Development">
  <meta property="udemy_com:instructor" content="https://www.udemy.com/user/sgslo/">

  <meta property="og:title" content="Advanced React and Redux - Udemy">
  <meta property="og:url" content="https://www.udemy.com/react-redux-tutorial/">
  <meta property="og:description" content="Detailed walkthroughs on advanced React and Redux concepts - Authentication, Testing, Middlewares, HOC&#39;s, and Deployment">
  <meta property="og:image" content="https://udemy-images.udemy.com/course/480x270/781532_8b4d_6.jpg">

  <meta name="twitter:title" content="Advanced React and Redux - Udemy">
  <meta name="twitter:url" content="https://www.udemy.com/react-redux-tutorial/">
  <meta name="twitter:description" content="Detailed walkthroughs on advanced React and Redux concepts - Authentication, Testing, Middlewares, HOC&#39;s, and Deployment">
  <meta name="twitter:image" content="https://udemy-images.udemy.com/course/480x270/781532_8b4d_6.jpg">

  <meta itemprop="name" content="Advanced React and Redux - Udemy">
  <meta itemprop="url" content="https://www.udemy.com/react-redux-tutorial/">
  <meta itemprop="description" content="Detailed walkthroughs on advanced React and Redux concepts - Authentication, Testing, Middlewares, HOC&#39;s, and Deployment">
  <meta itemprop="image" content="https://udemy-images.udemy.com/course/480x270/781532_8b4d_6.jpg">

</head>
{% endhighlight %}

Well hello metadata. So what is all of this? Well, there isn't yet any standard metadata system, and since `meta` tags are basically roll-your-own, most social networks have. The `og` tags are used by Facebook, the `twitter` tags by Twitter. Udemy has even built some of their own custom `udemy_com` tags. Most sites will try to cover all of their bases, and include a hodge-podge of tags, many redundant, just to make sure they don't spoil their chances of being the next viral sensation.

In all of these cases you'll use `attr('content')` to get the information you need from the meta tag, but the selector is a little more complicated. Standard class or id selectors obviously won't work, which is why you'll want jQuery's attribute selector. For the Twitter title for example, that would look like `$('meta[name="twitter:title"]')`. For the OG title, it would be `$('meta[property="og:title"]')`. Armed with these tools, we could easily write a simple metadata scraper:

{% highlight javascript %}
var cheerio = require('cheerio');

var scrape = function(html) {
  var $ = cheerio.load(html);

  return {
    title: $('meta[property="og:title"]').attr('content'),
    url: $('meta[property="og:url"]').attr('content'),
    desc: $('meta[property="og:description"]').attr('content')
  };
};
{% endhighlight %}

This code will work assuming every site always uses Facebook metadata, which is not as reliable as you might think. And what if, heaven forbid, they don't use `meta` tags at all? If your needs are simple, you may be fine with a scraper that only works most of the time, but if you're planning on building something really robust, you'll need a system.

### Keep It Organized With JSON

What we want is an array of possible tags we can have Cheerio cycle through until it finds a match. This is exactly the sort of data we can store out of the way in a seperate JSON file. For example, if we wanted to design a slightly more robust scraper for title and description, the JSON file might look like this:

{% highlight json %}
{
  "title": [{
    "prop": "name", 
    "val": "title"
  }, {
    "prop": "itemprop", 
    "val": "name"
  }, {
    "prop": "property", 
    "val": "og:title"
  }, {
    "prop": "name", 
    "val": "twitter:title"
  }],

  "description": [{
    "prop": "itemprop",
    "val": "description"
  }, {
    "prop": "property",
    "val": "og:description"
  }, {
    "prop": "name",
    "val": "twitter:description"
  }]
}
{% endhighlight %}

With that in place we can write a simple function to loop through the specified options until it finds something.

{% highlight javascript %}
var cheerio = require('cheerio');
var targets = require(./targets.json);

var scrape = function(html) {
  var $ = cheerio.load(html);

  // This function cycles through possible meta tags until it finds a match
  var scrapeFor = function(type) {
    for(var i = 0; i < targets[type].length; i++) {
      var prop = targets[type].prop;
      var val = targets[type].val;

      var scraped = $('meta[' + prop + '="' + val + '"]').attr('content');

      if (scraped) return scraped;
    }
  };

  return {
    title: scrapeFor('title'),
    desc: scrapeFor('description')
  };
};
{% endhighlight %}

The big advantage of this architecture, is that as you discover new pages with weird tags, adding them is as simple as creating a new element in one of your arrays. Of course, if you ever want to scrape something *other* than `meta` tags, your code will have to get a fair amount more complicated (heaven help you if you start scraping `text`), but I'm sure you can figure out the details for yourself.

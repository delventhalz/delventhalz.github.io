---
layout: post
title:  "Slim Down Your Code with Single-Line Conditionals"
date:   2016-01-23 13:55:00 -0600
categories: javascript
---
So you've been programming in JavaScript for a little while now. Your code is getting lean and mean and DRY as a California reservoir. Maybe you've even started to take advantage of some of JavaScript's single-line conditionals and you're wondering just how deep this rabbit hole goes. Maybe you have no idea what I'm talking about when I say "single-line conditionals". Whether you're a doe-eyed newbie or a hardened professional, this post has some fun tricks you may be interested in.

### Braces Optional

The traditional way to write an if statement looks something like this:

{% highlight javascript %}
var five = 5;

if (five > 4) {
  console.log('Five is greater than for!');
  spreadTheNews();
}
{% endhighlight %}

This is all fine and good, sticks to practices we're used to, makes a lot of sense. But what if we only have a single line of code in between those brackets?

{% highlight javascript %}
if (five > 4) {
  spreadTheNews();
}
{% endhighlight %}

Three lines of code for what amounts to one simple *if/then* statement? I don't know about you, but this is starting to feel downright wasteful. Well, the fix in this case is rather simple. Just kill the braces:

{% highlight javascript %}
if (five > 4) 
  spreadTheNews();
{% endhighlight %}

This is a totally valid JS statement and will execute just fine. Anytime an `if` is not followed by curly braces, JavaScript will look for the next statement, and consider that the *then* part of your conditional. Even better, since whitespace is ignored, let's kill that too:

{% highlight javascript %}
if (five > 4) spreadTheNews();
{% endhighlight %}

BAM! Single-line conditional. Not only is it less code, but by removing a bunch of extraneous braces, I think we've actually made our code more readable too. And what if our simple *if/then* has a simple *else*? Not a problem, `else` works the same way:

{% highlight javascript %}
if (five > 4) spreadTheNews();
else rethinkMath();
{% endhighlight %}

Simple. Readable. Short. My favorite kind of code. Technically you can do the same thing with `else if`'s too, though in that case I might add a bit of white space back in to help with readability. Of course, if your plan was *if/else* all along, there may be a better tool:

### The Ternary Operator

The ternatory operator (so named because it takes three operands), is one of the more intimidating pieces of JavaScript syntax a new coder is likely to encounter. It looks strange and alien, and the way it works is sometimes profoundly unclear. However, if you really want to save space, you can write the above `if else` statement in one single line:

{% highlight javascript %}
five > 4 ? spreadTheNews() : rethinkMath();
{% endhighlight %}

Frankly, I find that the ternary operator really hurts readability, and I generally avoid it for that reason. You *could* add some white space to help clear things up:

{% highlight javascript %}
five > 4
  ? spreadTheNews()
  : rethinkMath();
{% endhighlight %}

This is a debatable improvement, and no longer satisfies our single line desires. Why not just go back to an explicit `if else` at this point? Well, I usually do. BUT, there is a scenario in which there is no substitute for our ternary frienemy: assignment.

{% highlight javascript %}
var message = five > 4 ? 'excellent!' : 'wtf?';
{% endhighlight %}

Unlike an `if else` statement, the ternary operator *is an operator*. That means you are free to use it to the right of an assignment statement, which would throw one heck of a syntax error if you tried it with `if else`. Though this isn't necessarily any more readable than other ternary uses, it saves an amazing amount of code when you compare it to the alternative:

{% highlight javascript %}
var message;

if (five > 4) {
  message = 'excellent!';
} else {
  message = 'wtf?';
}
{% endhighlight %}

Gross.

###  The Case For Defaults

It turns out that there are more operators we can press into service to make our conditionals cleaner. One common example is to use the logical OR (`||`) to create default values in functions. For example:

{% highlight javascript %}
var returnInputOrFive = function(input) {
  input = input || 5;
  return input;
}
{% endhighlight %}

If you've never seen it before, this construct may be a little confusing, though it does read in a remarkably sensible way: *"input equals input or five."* In other words, if there's an input, input should be that, if not, it should be five. Just like with a ternary, the beauty of this set up is that we can put this conditional in places you couldn't put an `if` statement. Like for instance, as part of the return statement: 

{% highlight javascript %}
var returnInputOrFive = function(input) {
  return input || 5;
}
{% endhighlight %}

Same effect. Less Code. More readable. And imagine the alternate version using `if else`. Might as well go back to punch cards at that point.

But how does this bizarre hack of the OR operator actually work? The secret is in how JavaScript handles logical operators. In the case of `||`, JS is trying to determine whether either of the two operands is "truthy". As soon as it sees the first one is, there is no reason to bother with the second. So it doesn't. Furthermore, JS never bothers converting a truthy value to `true`, or a falsey value to `false`. Why bother? If the first operand is truthy, just return it. If not, the truthiness of the second operand will determine if the overall expression is truthy or not. So don't even check it, just return it and be done. 

One big gotcha to watch out for here: be sure the value of `input` can't be falsey value that you want to keep. In the above code for example, if we passed in an `input` of `0`, we would ignore it and return `5`. There are six falsey values, `false`, `0`, `NaN`, `''`, `undefined`, and `null`, and if our input evaluates to any of them, our default will be returned. But if that is the sort of behvior you are looking for, you can really clean up your code this way. Does that mean we can use `&&` to write single-line conditionals too?

### Using && to Write Single-Line Conditionals

Similar to the logical OR, `&&` checks to see if either of two operands is *falsey*. If the first operand is, there is no point in checking the second. This behavior is not taken advantage of nearly as often as `||`, but I did just write some actual server code that I couldn't have been done any other way:

{% highlight javascript %}
module.exports.seedUsers = function(next) {

  var addUser = function(i) {
    if (i === users.length) return next && next();

    User(users[i]).save()
      .then(function () {
        addUser(i + 1);
      });
  };

  addUser(0);
};
{% endhighlight %}

The above helper function may seem a little daunting out of context, so allow me to offer a brief explanation. Using an array of `users` defined elsewhere, I am creating a series of `User` objects in my database. The order is important here, so I can't iterate through `users` with a simple `for` loop. If one `User` happens to be slow to save, the next one would end up being created first. Not good. By using a recursive function I can ensure that each iteration will wait for the one before it.

And what about that insane (read: beautiful) single-line base case? I might have written it more clearly (read: uglily) like this:

{% highlight javascript %}
if (i === users.length) {
  if (next) {
    next();
  }
  return;
}
{% endhighlight %}

If you've never seen this usage before, a `return` statement is a handy way to break out of a function. No more code will be executed once you run that `return`. It's perfect for a recursive base case. Even better, if you need to call a function on your way out, rather than write them on seperate lines, you can just return the function call itself. So I might have used my own curly brace lesson from before and written: 

{% highlight javascript %}
if (i === users.length) return next();
{% endhighlight %}

But, I have one more problem problem. This helper function can be called in both asynchronus and synchronus environments, and so I do not know ahead of time whether or not `next` will be defined. The typical construct for calling a function only if it exists is the simple and readable `if (fun) fun();`, but if you tried to `return if (fun) fun();`, you would be rewarded with a big fat syntax error. Why? Remember, `if` and `else` are a *statements*, `?:`, `||`, and `&&` are *operators*. You cannot return a statement. But you can return the results of an operation. Which brings us back to my original implementation:

{% highlight javascript %}
if (i === users.length) return next && next();
{% endhighlight %}

If `next` is undefined, JavaScript has no need to evaluate `next()`, and will simply skip it, returning the value to the left (`undefined`, which is fine for my purposes). On the other hand, if `next` is a function (and therefore truthy), JS will look at the value on the right, see that there is a function that needs to be executed, and do so. A fairly complex series of operations have been reduced to one simple (okay, not that simple) line.

### With Great Power...

To me, JavaScript is the ultimate "eh, sure I guess", language. Can I just call undefined false? 
*"Eh, sure I guess."* 
Can I get rid of these curly braces? 
*"Eh, sure I guess."* 
What about this OR operator, seems like I could use it to set a default value. 
*"Eh, sure I guess."* 

That sort of flexibility can be very freeing, but there are pitfalls too. Remember that human beings still need to read your code. Before I pull out any of these tricks I always try to ask myself: does this make my code cleaner or messier? Does it make it more or less readable? 

Shorter is nice, but clearer is better. It's when you have the opportunity to do both that these tricks really shine.

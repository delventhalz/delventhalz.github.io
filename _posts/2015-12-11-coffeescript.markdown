---
layout: post
title:  "supercaffeinate with a CoffeeScript primer"
date:   2015-12-11 23:39:00 -0600
categories: javascript coffeescript
---
Today's Hack Reactor lesson got off to a challenging start with the sudden introduction of [CoffeeScript](http://coffeescript.org/), the "little language that compiles into JavaScript." The idea is to give JavaScript developers a way of writing code that is both shorter and cleaner, then compile that code into readable JavaScript. With relatively surprisingly few new commands, CoffeeScript succeeds at rounding off some of JS's rough edges, and even adds a bit of new functionality.

But despite that svelte profile, there was still a lot of new syntax to take in all at once. A cheat sheet seemed like the way to go, but most of what I found online was cluttered, difficult to read, and sometimes pages long. I wanted a quick reference guide, not an entire tutorial.

[So I made one.](/images/coffeescript-cheat-sheet.pdf)

If that's all you were looking for, click on the link and give it a download. One page. All of the good bits. I hope it serves you well. If you you'd like little bit more of a primer, I'll hit the bullet points below, but you may also want to check out [this beginner's guide](http://blog.teamtreehouse.com/the-absolute-beginners-guide-to-coffeescript), or this [in-depth series](http://www.ibm.com/developerworks/web/library/wa-coffee1/index.html), and of course the official docs, linked above.


###Installing and  Running CoffeeScript###
CoffeeScript is installed with [Node.js](https://nodejs.org/)'s package manager, npm. If you don't know what that is, or don't have it installed, you're going to want to get that done first. Afterwards, installing CoffeeScript is as simple as going into your command line and typing:

```
npm -g install coffee-script
```

You may need to preface that with a `sudo`, but as always, be careful with that thing. Once you have CoffeeScript installed, it's time to run it. Navigate to the directory your project is in and type:

```
coffee --output compiled --map --watch --compile ./
```

In this case we are telling CoffeeScript to compile every `.coffee` file in our source directory and save the compiled JavaScript to a folder named "compiled". By adding that `--watched` flag, CoffeeScript will look for any changes in the directory, and automatically compile any newly saved files there. Neat. At this point, you may also want to do some googlin' and see if your text editor of choice supports CoffeeScript syntax highlighting out of the box, or if it needs a plug-in.


###The Highlights of CoffeeScript###
* **No `;` or `{}`, and not nearly as much `()`**

> > CoffeeScript is designed to read a lot like english, so it does away with much of the more extraneous punctuation.

* **No `var` keyword. At all.** 

> > You'll actually break things if you try to throw `var` in there. Just assign values directly to a variables, and CoffeeScript will automatically instantiate them at the top of the current scope.

* **CoffeeScript is white space delimited, so indents deliberately**

* **`fn = ->` or `fn = (param) ->` creates functions**

> > Writing functions is quicker with the arrow notation. You also have the option of leaving off the `return` keyword, as CoffeeScript automatically returns the last last logically executed line of code.

* **Bracket `[]` and dot `.` notation are essentially unchanged.**

* **CoffeeScript probably has a keyword for that conditional you wanted**

> > `and`, `or`, `unless`, `then`, `is`, `isnt`, `yes`, `no`, `off`, to name a few. Just use `>` and `<` for greater than, and less than though.

* **Dynamically create and access arrays with dots**

> > `[1...4]` will automatically generate the array `[1, 2, 3]`, and `[1..4]` does the same thing, but includes the last value. Similarly you can create a slice of your existing array with `array[2...4]`.

* **Classes are much improved**

> > CoffeeScript allows one word [Pseudoclassical](/posts/2015-11-30-tldr-of-classes.html) class creation with the keyword `class`, class inheritance with the keyword `extends`, and method inheritance with the keyword `super`.


###Code Comparison!###
Let's see it in action:

<div>
<span class="comparison">
{% highlight coffeescript %}
#Some examples of CoffeeScript code
sum = (x, y=x) -> x + y
arr = [1..10]

arr = for num, i in arr
	sum num, arr[i+1]
	
for num in arr[2...7]
	if num isnt 5 and num is not 7
		console.log "This #{num} is not 5 or 7"
		
		
		
		
		
		
		
		
		
		
		
{% endhighlight %}
</span><!--

--><span class="comparison">
{% highlight javascript %}
//The equivalent JavaScript Code
var sum = function(x, y) {
	y = y || x;
	return x + y;
};

var arr = [];

for (var i = 0; i <= 10; i++) {
	arr.push(i);
}

for (var j = 0; j < arr.length; j++) {
	arr[0] = sum(arr[i], arr[i+1]);
}

for (var k = 2; k < 7; k++) {
	if (arr[k] !== 5 && arr[k] === !7 ) {
		console.log("This" + arr[k] + "is not 5 or 7");
	}
}
{% endhighlight %}
</span>
</div>


###The Cheat Sheet###
And finally, the cheat sheet linked above. It is by no means exhaustive, but contains examples of most of the most useful CoffeeScript syntax, along with some brief explanations where necessary. Use it as you'd like, and may your JavaScript be a little more caffeinated. 

<a href="/images/coffeescript-cheat-sheet.pdf"><embed src="/images/coffeescript-cheat-sheet.pdf" width="450" height="582" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html"></a>
---
layout: post
title:  "the TL;DR of this, new, and prototype"
date:   2015-11-30 22:28:27 -0600
categories: javascript
---
For me, some of the most confusing things as a new JavaScript developer were the keywords `this`, `new`, and `prototype`. Being someone who started with the strongly [object oriented](https://en.wikipedia.org/wiki/Object-oriented_programming "In OO programming, computer programs are designed by making them out of objects that interact with one another.") language Java (no relation) only made my confusion worse: *"I use `new` to create a new instance of a class? Sounds familiar. But wait, why am I adding methods to a `prototype`? Seems a bit roundabout. And what exactly is `this` referring to again???"* I was learning what to do by rote, which made mistakes common, trips to google frequent, and coding miserable.

Until last week.

Last week Hack Reactor dropped a bombshell of lesson on me. The mists parted, and three of the most confusing keywords in JavaScript suddenly made sense. It all starts with <a href="https://en.wikipedia.org/wiki/Class_(computer_programming)" title="extensible templates for creating objects, providing initial values for properties and implementations of behavior (methods)">classes</a>. You see, while some languages are built from the ground up to support object-oriented tools, JavaScript is not one of those languages. So the ways you can build a class are a little more . . . improvised.



###Functional Style Classes###
{% highlight javascript %}
var makeDude = function(name) {
	var dude = {};
	
	dude.name = name;
	dude.thumbs = 2;
	dude.greeting = function() {
		console.log("Who has " + dude.thumbs + "thumbs?" + 
		dude.name + " does!");
	};
	
	return dude;
};

var bob = makeDude('Bob');

bob.greeting(); // "Who has 2 thumbs? Bob does!" 
{% endhighlight %}

Functional classes are perhaps the most straightforward of the bunch. You want a thing, you make the thing, you return the thing. Our code here allows us to create as many dudes as we like, and we know they'll all have a name, two thumbs, and a greeting function. It's easy to follow the code, easy to write the code, and we don't need to use any weird words.

But, what if we need to make thousands of dudes? Suddenly that greeting function, which is identical for each dude, is starting to hog a lot of memory, needlessly getting remade over and over again. Wouldn't it be nice if there were a way all the dudes could share one greeting?



###Functional-Shared Style Classes###
{% highlight javascript %}
var makeDude = function(name) {
	var dude = {};
	
	dude.name = name;
	dude.thumbs = 2;
	dude.greeting = dudeMethods.greeting;
	
	return dude;
};

var dudeMethods = {};

dudeMethods.greeting = function() {
	console.log("Who has " + dude.thumbs + "thumbs?" + 
	dude.name + " does!");
};

var bob = makeDude('Bob');

bob.greeting(); // ???
{% endhighlight %}

Simple! Easy. We've made a separate object `dudeMethods` to hold all of methods we might want to assign to dudes. And even if we end up with hundreds, we can assign them all in one line of code (if we have (Underscore.js)[http://underscorejs.org] installed) with `_extend(dude, dudeMethods);`. Now our dudes are all using the same greeting, we're saving a ton of memory, and still no weird words. Awesome!

Well . . . no, not quite. Unfortunately the above code is broken and will behave in unexpected ways. There is one big step we missed. Now that `greeting` is being defined outside of `makeDude`, the variables `dude.thumbs` and `dude.name` no longer have any meaning. `dude`  defined elsehwere, and there is no way for `dudeMethods.greeting` to have any idea what they are. 

That's where `this` comes in. It seems like dark magic, but think of `this` as just another parameter. Just like `makeDudes` gets a `name` parameter, `greeting` function can have a `this` parameter. The only difference: we pass it in with dot notation. When we call `bob.greeting()` later, `bob` will be set to `this`. So if we rewrite our greeting function slightly...

{% highlight javascript %}
dudeMethods.greeting = function() {
	console.log("Who has " + this.thumbs + "thumbs?" + 
	this.name + " does!");
};

var bob = makeDude('Bob');

bob.greeting(); // "Who has 2 thumbs? Bob does!" 
{% endhighlight %}

The keyword `this` gets thrown around a lot in JavaScript, with big words like *"runtime context"*, but just think of it as a parameter, and your life will be much easier. The big exception is when you try to use `this` in a function that was called without any object to the left of the dot. In that case, it just ends up pointing to the *"global scope"* (usually the browser window), which is a useless and kind of confusing feature. But hey. JavaScript.



###Prototypal Style Classes###
{% highlight javascript %}
var makeDude = function(name) {
	var dude = Object.create(dudeMethods);
	
	dude.name = name;
	dude.thumbs = 2;
	
	return dude;
};

var dudeMethods = {};

dudeMethods.greeting = function() {
	console.log("Who has " + this.thumbs + "thumbs?" + 
	this.name + " does!");
};

var bob = makeDude('Bob');

bob.greeting(); // "Who has 2 thumbs? Bob does!"
{% endhighlight %}

The Prototypal method of creating classes in JavaScript, despite it's name, does not use the keyword `prototype` at all. In fact, it's not much different from Functional-Shared. We still have `dudeMethods` holding our functions, we're just taking advantage of `Object.create`'s ability to make a new copy of an object to save a step or two. Since our dudes start out as copies of `dudeMethods`, there's no need to explicitly assign those methods anymore.

Easy enough, but whatever happened to `new` and `prototype`?



###Pseudoclassical Class Style###
{% highlight javascript %}
var Dude = function(name) {
	this.name = name;
	this.thumbs = 2;
};

Dude.prototype.greeting = function() {
	console.log("Who has " + this.thumbs + "thumbs?" + 
	this.name + " does!");
};

var bob = new Dude('Bob');

bob.greeting(); // "Who has 2 thumbs? Bob does!"
{% endhighlight %}

*"What in heaven's name is this now?!? Where did all of the code go? If `this` is an object calling a function shouldn't it refer the browser window here? What the heck are `new` and `prototype` doing anyway???"* Believe it or not, this code is actually very similar to the Prototypal class from before. 

The big thing to understand is that the keywords `new` and `prototype` are conveniences ginned up in order to save developers from writing a bit of code. Nothing particularly new is happening under the hood. For example, `prototype` is nothing more than an object automatically created by JavaScript and attached to every function (remember that in JavaScript, functions are themselves objects, which means that they can have their own properties). `Dude.prototype` is very similar to `dudeMethods` from before, the big difference being we didn't have to build it ourselves.

What about `new`? Well, that one is a little stranger, but still not so different from what we've seen before. By calling a function with the `new` keyword, we call it in *"constructor mode"*, which means nothing more than that JavaScript will automatically insert two lines of code for us: one to set `this` to a newly created copy of the function's `prototype`, and one to return `this`. In other words, when we actually run `new Dude()` above, the code it will look like more like this:
{% highlight javascript %}
var Dude = function(name) {
	this = Object.create(Dude.prototype); // <-- automatically created at runtime
	this.name = name;
	this.thumbs = 2;
	return this; // <-- automatically created at runtime
}
{% endhighlight %}

Almost identical to our Prototypal class from before! We can clearly see why `this` doesn't refer to the browser window. The very first line of the code now explicitly sets `this` to be something else. JavaScript could have used "obj", "instance", or anything else to store the copy of `prototype`, but the designers chose `this`. It was already a reserved word and would otherwise serve little purpose inside a constructor function like `Dude`. A decision that would later confuse thousands of new developers like me, and possibly you. 



> ###TL;DR###
> * JavaScript was not built with classes in mind, and so has had to hack together different, sometimes odd, ways of creating them.
> * The keyword `this` is basically just another parameter for your functions, and will always refer to the object that called the function (i.e. for "obj.func()", obj is`this`).
> * Unless, of course, `this` is explicitly overridden, such as by the keyword `new` or by the ['call', 'apply', and 'bind' methods](http://javascriptissexy.com/javascript-apply-call-and-bind-methods-are-essential-for-javascript-professionals/ "the Call, Apply, and Bind methods are workhorses and should be part of your JavaScript repertoire for setting the 'this' value in functions").
> * Or if the function wasn't called by an object at all, because then `this` will refer to global scope (i.e. the window), because reasons.
> * A `prototype` is just an object which is automatically generated as a property of every function. It's used to store methods we would like every "instance" of the function to have (and for [inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain "each object has an internal link to another object called its prototype, which has a prototype of its own, and so on"), but don't worry about that for now).
> * The keyword `new` calls your function in "constructor mode", automatically inserting two lines of code. One at the beginning which sets `this` to be a copy of the `prototype`, and one at the end which returns `this`.
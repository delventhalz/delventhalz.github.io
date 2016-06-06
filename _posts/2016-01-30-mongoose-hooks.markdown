---
layout: post
title:  "The How's Why's and WTF's of Mongoose Hooks"
date:   2016-01-30 14:15:16 -0600
categories: javascript
---
For those of you unfamiliar, [Mongoose](http://blog.modulus.io/getting-started-with-mongoose) is a popular [ODM](https://en.wikipedia.org/wiki/Object_Data_Manager) for [MongoDB](https://www.mongodb.com/what-is-mongodb). If the previous sentence made no sense to you, you should probably follow those links and do some reading, because this is about to get . . . technical.

Among Mongoose's many conveniences there is a variety of middleware called "hooks", which allow you to listen for certain database events, and trigger a function when they happen. A common example would be the "pre save" hook, which is often used in to hash a user's password before saving it to the database. That might look something like this:

{% highlight javascript %}
UserSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, null, null, function(err, hash) {
    user.password = hash;
    next();
  });
});
{% endhighlight %}

Here we see Mongoose at its best. It almost reads like english. Before we save a user, check to see if their password is being modified. If not, skip to the next thing. If so, hash it, and then go to the next thing. As long as the developer remebers to call `next` at some point in their hook so that Mongoose can continue, it is really hard to screw this thing up. And you can create a "post" hook just as easily:

{% highlight javascript %}
UserSchema.post('save', function(user) {
  console.log('User saved', user._id);
});
{% endhighlight %}

Note that with a post hook, Mongoose isn't going to wait for you to finish, so there is no `next` function passed in. Instead, you get the new document that was stored in the db. Hooray! Easy!

If your need for middleware stops there, then you probably know all you need to. But as I learned the hard way in a recent project, if you want some higher level interactions, it starts to get much much more complicated very quickly. What started as a convenience, begins to instead feel like a weight on your shoulders. Don't worry, I'm here to help. 

### The Many Many Events

Although `save` is by far the most common event to listen for in these hooks, you actually have a ton of options: `save`, `init`, `validate`, `update`, `find`, `findOne`, `findOneAndUpdate` . . . . Wait. What? How is "find" different from "findOne"? Does "update" fire when you "findOneAndUpdate"? "init" is for . . . when your document is new?

What each of these do and when they fire is not always particularly clear, and is generally poorly documented online. Trying to build the hooks you need for complex interactions with your various schema can end up being a real minefield. So let's start with just listing all of the available events, what they mean, and when they fire:

##### `save`

* Refers to a document being saved to the database
* Basically just fires on `doc.save()` or `Doc({...}).save()`
* Will *not* fire on `update`. More on that later.

##### `init`

* Refers to *contact with the database* being initialized
* In other words, it has nothing to do with initializing a new document
* Fires first on just about everything: `find`, `findOneAndUpdate`, `save` (usually), etc
* But won't fire on `remove`, `update`, or `save` when creating a new doc (i.e. `Doc({...}).save()`)

##### `remove`

* Refers to a document being removed/deleted from the db
* Fires on `doc.remove()`

##### `validate`

* Refers to Mongo validating the properties of an object before saving it
* Fires before "save" does on `doc.save()` and `Doc({...}).save()`

##### `update`

* Refers to . . . the Mongoose method "update" being called
* Has *nothing* to do with the general concept of db items being updated
* Fires on `doc.update()`, and **that is it**
* Does not fire on `findOneAndUpdate`, `findByIdAndUpdate`, or anything else

##### `find`

* Same deal as `update`, refers to the method "find", and that is all
* Fires on `Doc.find`
* Does not fire on `Doc.findOne`, `Doc.findById`, etc

##### `findOne`, `findOneAndUpdate`, `findAndUpdate`, `findById`, `findByIdAndUpdate`

* Like `find`, and `update`, you can probably guess when these events fire

### Wha? Why?

It's best to think of these events as being in two seperate categories. `save`, `init`, `remove`, and `validate` are all events fired by interaction with the database itself. `update`, `find`, and the others are all events fired by a particular Mongoose method being invoked. Why the distinction? And why doesn't a general db event like `save` fire when you are updating a document?

The reasons here are actually fairly technical. It is not actually possible to trigger a `save` event when you `update` a doc. You see, all of the various versions of update (`update`, `findOneAndUpdate`, etc) are what is called "atomic" methods. They don't actually pull anything out of the database. They go in, find the thing, and then modify it *in place*. So when you "save", by grabbing a thing, pulling it out, modifying it, and putting it back, the database will let everyone know: "Hey, someone is saving something here!" But if you just sneak in, and make a little tweak in place with `update`, the db has nothing to say.

Most of these "atomic" triggers then, are actually a convenience ginned up for Mongoose 4. In the past if you wanted to use nifty methods like `findOneAndUpdate`, you wouldn't have been able to use any hooks at all. They are definitely a huge value add for the ODM, but lumping all of these different sorts of events together can lead to a lot confusion for unfamiliar developers. So let's clear up some important differences now.

### Order Matters

First, declaring the hooks. For all of the method based events, **order is very important**:

{% highlight javascript %}
// This is the proper implementation.
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({...});

UserSchema.pre('save', function(next) {...});
UserSchema.pre('update', function(next) {...});

module.exports = mongoose.model('User', UserSchema);
{% endhighlight %}

The above will work fine. Both hooks are declared *before* you build the User model by invoking `mongoose.model()`. However, the below is broken:

{% highlight javascript %}
// This update hook will never fire. Ever.
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({...});

module.exports = mongoose.model('User', UserSchema);

UserSchema.pre('save', function(next) {...});
UserSchema.pre('update', function(next) {...});
{% endhighlight %}

You might shrug this off at first, "just declare hooks first", but this rule *does not apply to `save`, `init`, `validate`, or `remove`*. The following works just fine:

{% highlight javascript %}
// This works. Because reasons.
var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({...});

UserSchema.pre('update', function(next) {...});

module.exports = mongoose.model('User', UserSchema);

UserSchema.pre('save', function(next) {...});
{% endhighlight %}

Why? I actually have no idea on this one. But watch out.

### This Is Different

You may have noticed in my original "pre save" example, we made good use of the `this` variable. That time, `this` referred to the actual user we were saving. Super useful and convenient. In fact, it would have been hard to hash the password without it. Does `this` refer to the same thing in a "pre update" hook? Well . . . try running this code sometime if you're feeling adventurous:

{% highlight javascript %}
UserSchema.pre('update', function(next) {
  console.log(this);
});
{% endhighlight %}

What you'll get is a huge garbled mess of private variables and various methods. You my friend are looking at a Mongoose `Query` object. Wh-why? What am I supposed to do with this? Well, once again we're running up against some technical limitations. Because we're working atomically, nothing has been pulled out of the database. There is simply no user model to give you. Same applies to before a `find` resolves. Sorry.

The Query object does give us some options though. For example, say you have an `updatedAt` timestamp that you want to change on every `save`. That is easy as pie, and looks like this:

{% highlight javascript %}
UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
};
{% endhighlight %}

Brilliant. But I bet you can't guess how we'd do the exact same thing when we're handed a _Query_ on `update`:

{% highlight javascript %}
UserSchema.pre('update', function (next) {
  this.update({}, { updatedAt: Date.now() });
  next();
};
{% endhighlight %}

Although you don't have the object itself, the Query object does have access to the same update function you used originally. So what you are doing here is adding to that. And what if you want to do the same thing on `findOneAndUpdate`? Remember, these just trigger on the method call, so you'll have to set up a hook for each individual method you are listening for.

### Examples

At this point your questions may be answered, and you may be ready to go out and conquer the world of Mongoose middleware. Excellent. If not, keep reading for some actual implementations my team and I used in my recent project [Roadmap To Anything](http://map-anything.herokuapp.com/).

The setup: we have two schemas, `User` and `Roadmap`. A roadmap is an ordered collection of resources and lessons that people can follow to learn a thing. The user's schema must be able to track three sets of roadmaps: ones they've personally created, ones they've begun but haven't finished, and ones they've finished. The `UserSchema` then, will look something like this:

{% highlight javascript %}
var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId,
    hooks    = require('../modelHooks.js');

var UserSchema = new mongoose.Schema({
  username     : { type: String, required: true, unique: true },
  password     : { type: String, required: true },
  roadmaps     : {
    authored   : [ {type: ObjectId, ref: 'Roadmap'} ],
    inProgress : [ {type: ObjectId, ref: 'Roadmap'} ],
    completed  : [ {type: ObjectId, ref: 'Roadmap'} ]
  }
});

hooks.setUserHooks(UserSchema);

module.exports = mongoose.model('User', UserSchema);
{% endhighlight %}

Notice that our hooks were complicated and inter-related enough that it became worthwhile to move them to their own file. Also notice, that they are still declared *before* the User model is instantiated!

Now, let's build our hooks. First, when a new roadmap is created, we want a hook that will automatically add a roadmap to it's author's `authored` array. Since we are going to use `save` exclusively for creating new documents, and various versions of `update` for updating existing documents, we can use a "pre save" here:

{% highlight javascript %}
RoadmapSchema.pre('save', function(next) {
  var User = require('./users/userModel.js');
  var authorId = this.author;
  var roadmapId = this._id;

  var update = { $push:{ roadmaps.authored: roadmapId } };

  User.findByIdAndUpdate(authorId, update)
  .then(function() {
    next();
  });
});
{% endhighlight %}

Easy enough. Before saving itself, the roadmap will look for the author designated in its own `author` property and then send a db request to push itself to that user's authored roadmaps array. Assuming we only ever use `save` for new roadmaps, we're all set to go. If we were worried about `save` sometimes being used to update existing roadmaps, we could modify this solution by throwing in a check like `if (this.isNew)`, or by using `$addToSet` instead of pushing.

Now, for our next hook we are going to need `update`. Anytime a user is modified by adding a roadmap to their completed roadmaps array, we want to automatically remove that same roadmap from their in progress array. A roadmap cannot be both in progress and completed. Since our plan is to use functions like `User.findOneAndUpdate` and `User.findByIdAndUpdate` elsewhere in our code, we cannot rely on the "save" event. And since there are three different possible method triggers we could be listening for, we'll first abstract our logic into a helper function which we can call on each trigger:

{% highlight javascript %}
UserSchema.pre('update', function(next) {
  handleCompletedRoadmaps.call(this, next);
});

UserSchema.pre('findOneAndUpdate', function(next) {
  handleCompletedRoadmaps.call(this, next);
});

UserSchema.pre('findByIdAndUpdate', function(next) {
  handleCompletedRoadmaps.call(this, next);
});
{% endhighlight %}

Notice how we make sure to `call` our heper function and pass in the current `this` context. As messy as that Query object is, we're going to need it.

{% highlight javascript %}
var handleCompletedRoadmaps = function (next) {
  var completeId;

  if (query._update.$addToSet) {
    completeId = this._update.$addToSet['roadmaps.completed'];
  }

  if(completeId) { 
    this.update({}, { $pull:{ 'roadmaps.inProgress': completeId } });
  }
  
  next();
};
{% endhighlight %}

Woof. Okay, let's parse through this. While adding to an update is relatively straightforward (just use `this.update()`), figuring out what is already being updated, like we need to do here, is little bit more of a challenge. Actually, if anyone knows a more standards compliant way to do it, please [email it to me](mailto:delventhalz@gmail.com). In the mean time, this somewhat hacky way is the best I was able to figure out.

So, on that Query object will be a property called `_update` which is an object that contains all of the different updates you are about to make. What we want to know is if anyone is trying to add to the `roadmaps.completed` set. If they were, `_update` would look like this: `{$addToSet: {'roadmaps.completed': 'SOME REALLY LONG ID STRING'}}`. So first we check to make sure there is an `$addToSet` property, and then we set `completeId` to that long id string.

Assuming we set `completeId` to something, we know we have to add a `$pull` to our update, and do so using the same `this.update` method we used in the `updatedAt` example earlier. Invoke `next` and we're done.

That's it! Hopefully these examples, and the preceeding explanations, helped you grasp a little more of the logic and methodology behind Mongoose hooks. The learning curve is steep, but they are indispensable tools which allow you to wire up your database in loads of interesting and powerful ways. Happy coding!

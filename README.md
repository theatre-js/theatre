# TheaterJS

This is the repo for the TheaterJS app. It contains the Launcher Backend, Launcher Frontend, and TheaterJS Studio.

### Aliases

We'll have very few aliases in this project. All you need to remember are:

* `$src` points to `app/src`
* `$lb` points to 'app/src/lb'
* `$lf` points to 'app/src/lf'
* `$shared` points to 'app/src/shared'

### A note about all the classes

If you've taken a look at the code, you've noticed a bunch of opportunities to do away with classes and use observables instead. Examples are 'AttributesApplier`, `SideEffectsApplier', etc.

I don't like the fact that we've written classes whose job is basically to tap into an emitter on start, and untap on stop. As far as I can imagine, those chunks of code can be simplified if they were rewritten with observables. We didn't have time to do that because we were very close to MVP, but at some point this problem has to be solved. These classes in their current form are difficult to understand and very easy to break. I loathe having to explain to someone how they work (even though they have a very simple responsibility).

Fortunately, all of these classes are there to apply side-effects. That's an area we spend very little time in. Most of our time is spent in side-effect-free parts of the code, and those parts are already declarative and relatively easy to understand. But on the off chance that you're the unlucky individual who has to change side-effectful code in a major way and you feel these classes are really getting in your way, then I recommend you to explore libraries like RxJS or xStream, and perhaps do a rewrite using those libraries. xStream seems like a nice choice atm because it only supports hot observables.
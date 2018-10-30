# TheatreJS

This is the repo for the TheatreJS app. It contains the Launcher Backend, Launcher Frontend, and TheatreJS Studio.

### Aliases

We'll have very few aliases in this project. All you need to remember are:

* `$src` points to `app/src`
* `$lb` points to 'app/src/lb'
* `$lf` points to 'app/src/lf'
* `$shared` points to 'app/src/shared'
* `$root` points to 'app/'

### Common practices

#### Put code close to where it is primarily used

We *used* to put the sagas of a module in a `[module]/sagas.js` file, or the action creators in `[module]/actions.js` file. Same way with selectors: `[module]/selectors.js`. We'd then import each of the stuff from each file, into the module that uses them.

This is how things *used* to be:

```javascript
// [module]/selectors.js

export const getPanelPosition = (state, id) => state.panels[id].position

// [module]/components/Panel.js
import {getPanelPosition} from '[module]/selectors'
```

This is all good and well _IF_ `getPanelPosition()` is bound to be imported from multiple different files. _BUT_, if `getPanelPosition()` is only used from inside `[module]/components/Panel.js`, then it's better to just defined it there and not put it in `selectors.js`.

This is the better way to do it:

```javascript
// [module]/components/Panel.js

export const selectors = {
  getPanelPosition: (state, id) => state.panels[id].position,
}
```

### A note about all the classes

If you've taken a look at the code, you've noticed a bunch of opportunities to do away with classes and use observables instead. Examples are 'AttributesApplier`, `SideEffectsApplier', etc.

I don't like the fact that we've written classes whose job is basically to tap into an emitter on start, and untap on stop. As far as I can imagine, those chunks of code can be simplified if they were rewritten with observables. We didn't have time to do that because we were very close to MVP, but at some point this problem has to be solved. These classes in their current form are difficult to understand and very easy to break. I loathe having to explain to someone how they work (even though they have a very simple responsibility).

Fortunately, all of these classes are there to apply side-effects. That's an area we spend very little time in. Most of our time is spent in side-effect-free parts of the code, and those parts are already declarative and relatively easy to understand. But on the off chance that you're the unlucky individual who has to change side-effectful code in a major way and you feel these classes are really getting in your way, then I recommend you to explore libraries like RxJS or xStream, and perhaps do a rewrite using those libraries. xStream seems like a nice choice atm because it only supports hot observables.

# Troubleshooting

### `git clone` fails with 'The remote end hung up unexpectedly'

Not sure why, but this fixed it for me:

```bash
$ git config --global http.postBuffer 524288000
```
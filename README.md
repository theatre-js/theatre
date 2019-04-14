# Theatre.js

This is the repo for the Theatre.js library.

## Aliases

We'll have very few aliases in this project. All you need to remember are:

* `$root` points to `app/`
* `$src` points to `app/src`
* `$shared` points to `app/src/shared
* `$tl` points to `app/tl`

## Code quality

The best way to learn our code quality is to have someone with more experience than you review your code. _DO NOT_ wait til you've written a thousand lines of code before you ask someone for a review. Ask for reviews early, and often, as long as the review process doesn't disturb your flow.

### Type annotations

Type annotations help us keep our runtime bugs to a minimum. For that, we need to keep our annotations as precise as possible. Here are some guidelines:

* If a value can only be one of `"foo"` and `"bar"`, do not type it as `string`. Use a union of literals instead.

  ```typescript
  // Bad:
  function doX(input: string) {
    if (input === "foo") {
      alert("is foo")
    } else if (input === "bar") {
      alert("is bar")
    }
  }

  // Good:
  function doX(input: "foo" | "bar") {
    if (input === "foo") {
      alert("is foo")
    } else if (input === "bar") {
      alert("is bar")
    }
  }
  ```
* The `Function` type is not useful. It matches any function, including classes. Use a detailed function signature instead.

  ```typescript
  // Bad:
  function transformTuple(tuple: Array<number>, transformer: Function) {
    return tuple.map(transformer)
  }

  // Good:
  function transformTuple(tuple: Array<number>, transformer: (input: number) => number) {
    return tuple.map(transformer)
  }
  ```
* The `Object` type is rarely useful. Most JS values are objects. Use a more precise type instead.

  ```typescript
  // Bad:
  function fullname({firstName, lastName}: Object) {
    return firstName + ' ' + lastName
  }

  // Good:
  function fullname({firstName, lastName}: {firstName: string, lastName: string}) {
    return firstName + ' ' + lastName
  }
  ```
* Sometimes you have to use the `any` type. Maybe you don't have the time to figure out the type annotation. Or maybe you don't know how to. In these situations, you should mention in the code why you used that `any`. We have standardized this in a few aliases of `any`. So, instead of directly using `any`, use one of these aliases instead (they're in defs.d.ts):
  * `$NeedHelp`: Use this type if you don't know how to annotate a value. Your code reviewer will then help you figure out the proepr type.
  * `$Unexpressable`: Use this type if you know that TypeScript simply cannot express the type you're looking for (maybe in a future version they can?). In future versions of TypeScript, we'll check if some of the `$Unexpressable` types have recently become expressable.
  * `$AnyBecauseOfBugInTS`: Use this type if a bug in TypeScript is holding you back. Often these bugs are fixed in minor versions, and then we'll be able to do a proper annotation instead.
  * `$FixMe`: With this type, you're signaling that it's better to use a better annotation, but that is not urgent. Maybe you don't have the time to do the proper annotation. You're also signaling that it's okay to merge the PR without fixing this annotation. (*Note*: Fixing the `$FixMe` types in the codebase could be a fun way to kill time).
  * `$IntentionalAny`: With this type, you're signaling that we _should_ use the `any` type here, and no one needs to change this later.

## Formatting

### Prettier

Prettier is configured. There is a precommit hook that checks if all files follow the code
standard. If you get an error, run `npm run ci:fix-formatting`.

## Common practices

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

# Troubleshooting

### `git clone` fails with 'The remote end hung up unexpectedly'

Not sure why, but this fixed it for me:

```bash
$ git config --global http.postBuffer 524288000
```
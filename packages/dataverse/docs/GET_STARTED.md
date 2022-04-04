# Into the dataverse - Get started with `@theatre/dataverse`

Dataverse is the reactive dataflow library
[Theatre.js](https://www.theatrejs.com) is built on. It is inspired by ideas in
[functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming)
and it is optimised for interactivity and animation. This guide will help you to
get started with the library.

## Main concepts

A good analogy for `dataverse` would be a spreadsheet editor application. In a
spreadsheet editor you have cells that store values, cells that store functions,
that manipulate the values of other cells and the cells have identifiers (eg.
A1, B3, etc..., pointers) that are used to reference them in functions. These
are similiar to the set of tools that `dataverse` provides for manipulating
data. Here's a quick comparison:

| `dataverse`             | Spreadsheet editor analogy          | role                                                                                            |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| sources (`Box`, `Atom`) | a cell that holds a value           | `Box`: holds a simple value, `Atom`: holds an object with (sub)props to be tracked              |
| derivations             | functions                           | changes recorded on the value of an `Box` or `Atom`                                             |
| pointers                | addresses of the cells (`A1`, `B3`) | they point to a source, don't contain values themselves                                         |
| tappables               | -                                   | objects that can be observed for changes to execute a callback function when the change happens |

Some concepts in `dataverse` go beyond the spreadsheet analogy. For example we
want to make the changes performant, so we make them on-demand and only show
them when it's necessary (eg.: only show a change in an animated value when the
screen gets repainted) which introduces new concepts like `Ticker`-s (we'll have
a look at them later).

## Practical Examples

Here we collected a few examples that introduce the main concepts/tools in
`dataverse` through practical examples. We strongly recommend running the
examples on your local machine (see the [Setup](#setup) section to see how to
configure your local environment before running the examples).

0. [Setup: How to configure your local environment before running the examples](#setup)
1. [`Box`](#box-storing-simple-values)
2. [Observing values](#observing-values)
3. [`map()`](#map)
4. [`prism()`](#prism)

### Setup

You are encouraged to follow the examples on your machine by cloning the
[`theatre-js/theatre`](https://github.com/theatre-js/theatre/) repo and creating
a new directory and file called `dataverse/index.tsx` in
`theatre/packages/playground/src/personal/` (this directory is already added to
`.gitignore`, so you don't have to worry about that).

### `Box`: storing simple values

Let's start with creating a variable that holds a simple value, which we can
change and observe later:

```typescript
import {Box} from '@theatre/dataverse'

// `theatre/packages/playground/src/personal/dataverse/index.tsx`

const variableB = new Box('some value')
console.log(variableB.get()) // prints 'some value' in the console
```

> As you can see there's a naming convention here for boxes (`variableB`),
> pointers (`variableP`), derivations (`variableP`), etc...

Now we can change the value:

```typescript
variableB.set('some new value')
console.log(variableB.get()) // prints 'some new value' in the console
```

### Observing values

Let's say you want to watch the value of `variableB` for changes and execute a
callback when it does change.

```typescript
import {Box} from '@theatre/dataverse'

const variableB = new Box('some value')
// Change the value of variableB to a random number in every 1000 ms
const interval = setInterval(() => {
  variableB.set(Math.random().toString())
  console.log('isHot?', variableB.derivation.isHot)
}, 1000)

// Watch `variableB` changes and print a message to the console when the value of
// `variableB` changes
const untap = variableB.derivation.changesWithoutValues().tap(() => {
  console.log('value of variableB changed', variableB.derivation.getValue())
})

// Stop observing `variableB` after 5000 ms
setTimeout(untap, 5000)

// Clear the interval after 7000 ms
setTimeout(() => {
  clearInterval(interval)
  console.log('Interval cleared.')
}, 7000)
```

A few notes about the example above:

- `variableB.derivation.changesWithoutValues()` returns a tappable that we can
  tap into (observe).
- The `tap()` method returns the `untap()` function which aborts th
- As long as `variableB` is tapped (observed) `variableB.derivation.isHot` will
  bet set to `true` automatically

What if you want to keep a derivation hot manually even if there's no tappable
attached to it anymore? In this case you can use the `keepHot()` method as seen
below: out this modified version of the previous example:

```typescript
variableB.set('some new value')
console.log(variableB.get()) // prints 'some new value' in the console

// Change the value of variableB to a random number in every 1000 ms
const interval = setInterval(() => {
  variableB.set(Math.random().toString())
  // This will print 'isHot? true' every time, since we kept
  // the derivation hot by calling the 'keepHot()' method
  console.log('isHot?', variableB.derivation.isHot)
}, 1000)

// Watch `variableB` changes and print a message to the console when the value of
// `variableB` changes
const untap = variableB.derivation.changesWithoutValues().tap(() => {
  console.log('value of variableB changed', variableB.derivation.getValue())
})

// Stop observing `variableB` after 5000 ms
setTimeout(untap, 5000)

// Keep the derivation hot
variableB.derivation.keepHot()

// Clear the interval after 7000 ms
setTimeout(() => {
  clearInterval(interval)
  console.log('Interval cleared.')
}, 7000)
```

### `map()`

It is also possible to create a derivation based on an existing derivation:

```typescript
const niceNumberB = new Box(5)
const isNiceNumberOddD = niceNumberB.derivation.map((v) => v % 2 === 0)

// the following line will print '5, false' to the console
console.log(niceNumberB.get(), isNiceNumberOddD.getValue())
```

The new derivation will be always up to date with the value of the original
derivation:

```typescript
import {Box} from '@theatre/dataverse'

const niceNumberB = new Box(5)
const isNiceNumberOddD = niceNumberB.derivation.map((v) =>
  v % 2 === 0 ? 'even' : 'odd',
)

const untap = isNiceNumberOddD.changesWithoutValues().tap(() => {})

const interval1 = setInterval(untap, 5000)
const interval2 = setInterval(() => {
  niceNumberB.set(niceNumberB.get() + 1)
  console.log(
    `${niceNumberB.get()} is an ${isNiceNumberOddD.getValue()} number.`,
  )
}, 1000)

// clear the intervals
setTimeout(() => {
  clearInterval(interval1)
  console.log('interval1 is cleared.')
}, 7000)

setTimeout(() => {
  clearInterval(interval2)
  console.log('interval2 is cleared.')
}, 7000)
```

### `prism()`

At this point we can make derivations that can track the value of an other
derivation with [the `.map()` method](#map), but what if we want to track the
value of multiple derivations at once for the new derivation? This is where the
`prism()` function comes into play.

Let's say that we have two derivations and we want to create a derivation that
returns the product of their values. In the spreadsheet analogy it would be like
having two cells with two functions and third cell that contains a function that
calculates the product of the previous two cells. Whenever the first two cells
recalculate their value, the third cell will also do the same.

Here's how we would solve this problem in `dataverse`:

```typescript
import {Box, prism} from '@theatre/dataverse'

const widthB = new Box(1)
const heightB = new Box(2)
const padding = 5

const widthWithPaddingD = widthB.derivation.map((w) => w + padding)
const heightWidthPaddingD = heightB.derivation.map((h) => h + padding)

const areaD = prism(() => {
  return widthWithPaddingD.getValue() * heightWidthPaddingD.getValue()
})

console.log('area: ', areaD.getValue())
widthB.set(10)
console.log('new area: ', areaD.getValue())
```

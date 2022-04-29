# Into the dataverse - Get started with `@theatre/dataverse`

This guide will help you to get started with `dataverse`, the reactive dataflow
library that [Theatre.js](https://www.theatrejs.com) is built on. It is inspired
by ideas in
[functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming)
and it is optimised for interactivity and animation.

## Main concepts

A good analogy for `dataverse` would be a spreadsheet editor application. In a
spreadsheet editor you have cells that store values, cells that store functions,
that manipulate the values of other cells. The cells have identifiers (e.g.
`A1`, `B3`, etc...) that are used to reference them in the functions. These are
similar to the set of tools that `dataverse` provides for manipulating data.
Here's a quick comparison:

| `dataverse`             | Spreadsheet editor analogy          | role                                                                               |
| ----------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| sources (`Box`, `Atom`) | a cell that holds a value           | `Box`: holds a simple value, `Atom`: holds an object with (sub)props to be tracked |
| derivations             | functions                           | changes recorded on the value of an `Box` or `Atom`                                |
| pointers                | addresses of the cells (`A1`, `B3`) | they point to a (sub)prop of an `Atom`                                             |

Note that some concepts in `dataverse` go beyond the spreadsheet analogy.

## Practical Introduction

Here we collected a few examples that introduce the main concepts/tools in
`dataverse` through practical examples. We strongly recommend running the
examples on your local machine (see the [Setup](#setup) section to see how to
configure your local environment before running the examples).

0. [Setup your local environment for running the examples](#setup)
1. [`Box`](#box-store-simple-values)
2. [Observe values](#observe-values)
3. [`map()`](#map)
4. [`prism()`](#prism)
   - [A basic example](#a-basic-example)
   - [`prism.state()` and `prism.effect()`](#prismstate-and-prismeffect)
   - [Other methods of `prism()`](#other-methods-of-prism)
5. [`usePrism()` (from `@theatre/react`)](#useprism)
6. [`Atom`](#atom)
   - [`Atom` vs `Box`](#atom-vs-box)
   - [`Pointers`](#pointers)
   - [Update the value of an `Atom`](#update-the-value-of-an-atom)
7. [`Ticker`](#ticker-and-studioticker)

### Setup

You are encouraged to follow the examples on your machine by cloning the
[`theatre-js/theatre`](https://github.com/theatre-js/theatre/) repo and creating
a new directory and file called `dataverse/index.tsx` in
`theatre/packages/playground/src/personal/` (this directory is already added to
`.gitignore`, so you don't have to worry about that).

### `Box`: store simple values

Let's start with creating a variable that holds a simple value, which we can
change and observe later:

```typescript
import {Box} from '@theatre/dataverse'

// `theatre/packages/playground/src/personal/dataverse/index.tsx`

const variableB = new Box('some value')
console.log(variableB.get()) // prints 'some value' in the console
```

> As you can see there's a naming convention here for boxes (`variableB`),
> pointers (`variableP`), derivations (`variableD`), etc...

Now we can change the value:

```typescript
variableB.set('some new value')
console.log(variableB.get()) // prints 'some new value' in the console
```

### Observe values

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

- `variableB.derivation.changesWithoutValues()` returns a derivation / tappable that we can
  tap into (observe).
- The `tap()` method returns the `untap()` function which unsubscribes the observer function
- As long as `variableB` is tapped (observed) `variableB.derivation.isHot` will
  bet set to `true` automatically

## Hotness
As we saw above, derivations may or may not be "hot" 
(the same concept as "hot" Observables<sup>[ref](https://medium.com/codingthesmartway-com-blog/getting-started-with-rxjs-part-3-hot-and-cold-observables-4713757c9a88)</sup>). A derivation
is hot if and only if it is being tapped.

If you want to keep a derivation hot manually even if there's no tappable
attached to it anymore, you can use the `keepHot()` method.  Why would you
want to keep a derivation hot? Check out this example:

<table>
<tr>
  <td> 
   
without `keepHot()` 🥶 
   
  </td>
  <td> 
      
with `keepHot()` 🥵 
      
  </td>
</tr>
<tr>
  <td>

```typescript
const variableD = prism(() => {
  return performance.now()
})
console.log(variableD.getValue()) // e.g. 113.5
console.log(variableD.getValue()) // e.g. 114
// Notice they give different values 
```
   
  </td>
  <td>

```typescript
const variableD = prism(() => {
  return performance.now()
})
variableD.keepHot()
console.log(variableD.getValue()) // e.g. 113
console.log(variableD.getValue()) // e.g. 113
// Notice they give the same value! 
```

  </td>
</tr>
</table>

To see a full example of `keepHot`, check out this modified version 
of the example from the section above:

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

How does `keepHot` work? It's super simple, it just adds a tap to the derivation ([source](https://github.com/theatre-js/theatre/blob/aec6b2a25135e6264e7529e7d3800c4bc3badee6/packages/dataverse/src/derivations/AbstractDerivation.ts#L103-L105)).

### `map()`

It is also possible to create a derivation based on an existing derivation:

```typescript
const niceNumberB = new Box(5)
const isNiceNumberEvenD = niceNumberB.derivation.map((v) => v % 2 === 0)

// the following line will print '5, false' to the console
console.log(niceNumberB.get(), isNiceNumberEvenD.getValue())
```

The new derivation will be always up to date with the value of the original
derivation:

```typescript
import {Box} from '@theatre/dataverse'

const niceNumberB = new Box(5)
const isNiceNumberEvenD = niceNumberB.derivation.map((v) =>
  v % 2 === 0 ? 'even' : 'odd',
)

const untap = isNiceNumberEvenD.changesWithoutValues().tap(() => {})

const interval1 = setInterval(untap, 5000)
const interval2 = setInterval(() => {
  niceNumberB.set(niceNumberB.get() + 1)
  console.log(
    `${niceNumberB.get()} is an ${isNiceNumberEvenD.getValue()} number.`,
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

At this point we can make derivations that track the value of an other
derivation with [the `.map()` method](#map), but what if we want to track the
value of multiple derivations at once for the new derivation? This is where the
`prism()` function comes into play.

#### A basic example

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

#### `prism.state()` and `prism.effect()`

Prisms don't always follow the rules of functional programming: they can have
internal states and perform side effects using the `prism.state()` and
`prism.effect()` methods. Their concept and API is very similar to React's
`useState()` and `useEffect()` hooks.

The important thing to know about them is that:

- `prism.state()` returns a state variable and a function that updates it.
- `prism.effect()` receives two arguments:
  1. The first one is a key (a string), which should be unique to this effect
     inside the prism
  2. The second one is a callback function as an argument that gets executed
     when the derivation is created (or the dependencies in the dependency array
     change). The callback function may return a clean up function that runs
     when the derivation gets updated or removed.

Let's say you want to create a derivation that tracks the position of the mouse.
This would require the derivation to do the following steps:

1. Create an internal state where the position of the mouse is stored
2. Attach an event listener that listens to `mousemove` events to the `document`
3. Update the internal state of the position whenever the `mousemove` event is
   fired
4. Remove the event listener once the derivation is gone (clean up)

This is how this derivation would look like in code:

```typescript
import {prism} from '@theatre/dataverse'

const mousePositionD = prism(() => {
  // Create an internal state (`pos`) where the position of the mouse
  // will be stored, and a function that updates it (`setPos`)
  const [pos, setPos] = prism.state('pos', {x: 0, y: 0})

  // Create a side effect that attaches the `mousemove` event listeners
  // to the `document`
  prism.effect(
    'setupListeners',
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        setPos({x: e.screenX, y: e.screenY})
      }
      document.addEventListener('mousemove', handleMouseMove)

      // Clean up after the derivation is gone (remove the event
      // listener)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [],
  )

  return pos
})

// Display the current position of the mouse using a `h2` element
const p = document.createElement('h2')
const {x, y} = mousePositionD.getValue()
p.textContent = `Position of the cursor: [${x}, ${y}]`
document.querySelector('body')?.append(p)

// Update the element's content when the position of the mouse
// changes
mousePositionD.changesWithoutValues().tap(() => {
  const {x, y} = mousePositionD.getValue()
  p.textContent = `Position of the cursor: [${x}, ${y}]`
})
```

#### Other methods of `prism`

Prism has other methods (`prism.memo()`, `prism.scope()`, `prism.ref()`, etc)
inspired by React hooks, but they aren't used that much in `@theatre/core` and
`@theatre/studio`. You can check out the
[tests](../src/derivations/prism/prism.test.ts) or the
[source code](../src/derivations/prism/prism.ts) to get more familiar with them.

### `usePrism()`

You can also use derivations inside of React components with the `usePrism()`
hook from the `@theatre/react` package, which accepts a dependency array for the
second argument. If the prism uses a value that is not a derivation (such as a
simple number, or a pointer), then you need to provide that value to the
dependency array.

#### A simple example

Here's a simple example: we have a Box that contains the width and height of a
div (let's call it `panel`). Imagine that we want to have a button that changes
the width of the `panel` to a random number when clicked.

```typescript
import {Box} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import React from 'react'
import ReactDOM from 'react-dom'

// Set the original width and height
const panelB = new Box({
  dims: {width: 200, height: 100},
})

function changePanelWidth() {
  const oldValue = panelB.get()
  // Change `width` to a random number between 0 and 200
  panelB.set({dims: {...oldValue.dims, width: Math.round(Math.random() * 200)}})
}

const Comp = () => {
  const render = usePrism(() => {
    const {dims} = panelB.derivation.getValue()
    return (
      <>
        <button
          style={{
            display: 'block',
            height: 25,
            width: 200,
          }}
          onClick={() => changePanelWidth()}
        >
          Change the width
        </button>
        <div
          style={{
            display: 'block'
            width: dims.width,
            height: dims.height,
            backgroundColor: '#bd6888',
          }}
        ></div>
      </>
    )
  }, [panelB]) // Note that `panelB` is in the dependency array

  return render
}

ReactDOM.render(
  <div>
    <Comp />
  </div>,
  document.querySelector('body'),
)
```

#### The dependency array

If you remove `panelB` from the dependency array in the previous example you
might see that there's no change in the functionality of the `Change the width`
button. It surprisingly still works:

```typescript
// ...
const Comp = () => {
  const render = usePrism(() => {
    // ...
  }, []) // Here we removed `panelB` from the dependency array

  return render
}
// ...
```

The reason behind this behavior is that even though the value of `panelB` - the
`Box` instance - is cached, the cached `Box` instance's value is still tracked
inside the callback function (which uses `prism()` under the hood, and handles
every derivation inside as its dependency). However, if you change the value of
the `panelB` variable to another `Box` instance, then that change won't be
recognized inside the callback function if `panelB` is not included in the
dependency array of `usePrism()`. Let's look at another example to make things a
bit more clear:

```typescript
// ...

// Set the original width and height
const panelB = new Box({
  dims: {width: 200, height: 100},
})

// Create two new `Box` instances
const theme1B = new Box({backgroundColor: '#bd6888', opacity: 1})
const theme2B = new Box({backgroundColor: '#5ac777', opacity: 1})

function changePanelWidthAndThemeOpacity() {
  const oldValue = panelB.get()
  // Change `width` to a random number between 0 and 200
  const width = Math.round(Math.random() * 200)
  panelB.set({dims: {...oldValue.dims, width}})
  // Change opacity in the themes:
  const opacity = width > 100 ? width / 200 : width / 100
  theme1B.set({...theme1B.get(), opacity})
  theme2B.set({...theme2B.get(), opacity})
}

// DEPENDENCY ARRAYS DEMO
const Comp = () => {
  // Get the width of the panel
  const {width} = panelB.derivation.getValue().dims
  // If the width of the panel is greater than 100, then
  // set the value of the `theme` variable to `theme1B`,
  // otherwise use `theme2B`
  const theme = width > 100 ? theme1B : theme2B

  const render = usePrism(() => {
    const {dims} = panelB.derivation.getValue()
    const {backgroundColor, opacity} = theme.get()
    return (
      <>
        <button
          style={{
            display: 'block',
            height: 25,
            width: 200,
          }}
          onClick={() => changePanelWidthAndThemeOpacity()}
        >
          Change the width
        </button>
        <div
          style={{
            display: 'block',
            width: dims.width,
            height: dims.height,
            opacity,
            backgroundColor,
          }}
        ></div>
      </>
    )
    // Note that if the `theme` variable weren't included in the
    // dependency array, then the background color of the div
    // wouldn't be updated (the opacity still would).
    // (Feel free to try  it out.)
  }, [theme])

  return render
}

// ...
```

If you omit the `theme` variable from the previous example, then the background
color of the `div` element will not be updated when the value of the `theme`
variable does, while the opacity would track the changes of the width. This
happens, because in that case the callback function in `usePrism()` caches the
value of `theme`, which is `theme1B` when `usePrims()` is called for the first
time, and updates whenever `theme1B` changes. If you pass down `theme` as a
dependency to `usePrism()`, then the callback function will always use new new
value of `theme` (which is set to `theme2B` if the `div`'s width is smaller than
or equal to `100`), whenever it changes.

### `Atom`

Remember how we compared `Box`-es to cells in the spreadsheet-analogy? `Atom`-s
are also like cells in the sense that they also hold a value (although they only
work with objects), but there's a huge difference in how their value gets
updated.

#### `Atom` vs `Box`

`Box` uses strict equality for comparing new and old values, while `Atom` tracks
the individual properties and nested properties of an object. The following
example illustrates this difference between the two pretty well:

```typescript
import {Atom, Box, val, valueDerivation} from '@theatre/dataverse'

const originalValue = {width: 200, height: 100}

// Create a `Box` that holds an object
const panelB = new Box(originalValue)

console.log('old value (Box): ', panelB.derivation.getValue())
// Print the new value of `panelB` to the console
// every time it changes
panelB.derivation
  .changesWithoutValues()
  .tap(() => console.log('new value: (Box) ', panelB.derivation.getValue()))

// Set the value of the `panelB` to a new object that has
// the same properties with the same values as `panelB`.
// Note that this will get recognized as a change, since
// the two objects are not strictly equal.
panelB.set({...panelB.get()})

// Create an `Atom` that holds an object
const panelA = new Atom({width: 200, height: 100})

console.log('old value (Atom):', val(panelA.pointer))

// Create a derivation to track the value of `panelA`
// There are a lot of new information here, we'll come back
// to this line later.
const panelFromAtomD = valueDerivation(panelA.pointer)

// Print the new value of `panelA` to the console
// every time it changes
panelFromAtomD
  .changesWithoutValues()
  .tap(() => console.log('new value (Atom):', val(panelA.pointer)))

// Since the next line sets changes the value of `panelA` to what it
// already holds, it does not get recognized as a change.
// The `.setIn()` method is also new, we'll cover it later.
panelA.setIn(['width'], 200)

// The next line will trigger a change as expected
panelA.setIn(['width'], 400)
```

#### Pointers

You might have wondered what `val(panelA.pointer)` meant when you read this
line:

```typescript
console.log('old value (Atom):', val(panelA.pointer))
```

`dataverse` uses pointers that point to the properties and nested properties of
the object that the `Atom` instance holds as its value.

You can use the pointers to get the value of the property they point to, or to
convert them to a derivation using the `val()` and `useDerivation()` functions:

```typescript
const panelA = new Atom({width: 200, height: 100})

// Create a derivation
const panelFromAtomD = valueDerivation(panelA.pointer)

// Print the value of the property that belongs to the pointer
// Note that `panelA.pointer` and `panelA.pointer.width` are both
// pointers.
console.log(val(panelA.pointer)) // prints `{width: 200, height: 100}`
console.log(val(panelA.pointer.width)) // prints `100`
console.log(val(panelA.pointer.height)) // prints `200`
```

#### Update the value of an `Atom`

If you want to update the value of an `Atom`, you have first choose the
property/nested property that you want to update. Then you can use the names of
its ancestor properties in an array to define the path to the property for the
`setIn()` method:

```typescript
const panelA = new Atom({dims: {width: 200, height: 100}})

// Sets the value of panelA to `{dims: {width: 400, height: 100}}`
panelA.setIn(['dims', 'width'], 400)
```

### `Ticker` and `studioTicker`

The `Ticker` class helps us to schedule callbacks using a strategy. One such
strategy could by synchronizing the execution of certain actions with the
browser's repaint schedule to avoid changes that are invisible for the user and
would only worsen the performance. This could be implemented using the
`studioTicker` from the `@theatre/studio` package.

Here's an example: we want to increase the value of a counter variable by 1 in
every 10 ms and print the current value on every repaint for 1 s:

```typescript
import {Box} from '@theatre/dataverse'
import studioTicker from '@theatre/studio/studioTicker'

// Clear the console to make tracking the relevant logs easier
console.clear()

// Create a counter variable
const counterB = new Box(0)
// Create a variable to track the number of repaints
let numberOfRepaints = 0

// Increase the value of the counter variable by 1
// in every 10 ms
const interval = setInterval(() => {
  counterB.set(counterB.get() + 1)
  console.log(counterB.get())
}, 10)

// Increase the number of repaints by one every time
// a repaint happens
const untap = counterB.derivation
  .changes(studioTicker)
  .tap((newCounterValue) => {
    ++numberOfRepaints
    console.log(`VALUE ON REPAINT: ${newCounterValue}`)
  })

// Clean up everything after 1 s
setTimeout(() => {
  clearInterval(interval)
  untap()
  console.log('interval is cleared.')
  console.log(`Number of times when the counter got updated: ${counterB.get()}`)
  console.log(`Number of repaints: ${numberOfRepaints}`)
}, 1000)
```

When I run the example above using a 60 Hz refresh rate monitor (or when the
browser itself limits the repaints to 60 times per second), I see something like
this in the console:

```
Number of times when the counter got updated: 98
Number of repaints: 60
```

What happens is that the counter gets updated about `1000ms / 10ms = 100` times,
but only 60 of these changes can be shown on screen due to the refresh rate of
my monitor. The values of the counter when the repaints happen are also printed
to the console:

```
...
94
VALUE ON REPAINT: 94
95
96
VALUE ON REPAINT: 96
97
98
...
```

## Summary

We only covered the basics, there are much more to `Box`-es, `Atom`-s and
everything else in `dataverse`. You can always check the source code for more
information.

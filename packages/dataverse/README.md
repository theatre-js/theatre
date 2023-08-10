# @theatre/dataverse

Dataverse is the reactive dataflow library
[Theatre.js](https://www.theatrejs.com) is built on. It is inspired by ideas in
[functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming)
and it is optimised for interactivity and animation.

## Installation

```sh
$ npm install @theatre/dataverse
# and the react bindings
$ npm install @theatre/react
```

## Usage with React

```tsx
import {Atom} from '@theatre/dataverse'
import {useVal} from '@theatre/react'
import {useEffect} from 'react'

// Atoms hold state
const atom = new Atom({count: 0, ready: false})

const increaseCount = () =>
  atom.setByPointer(atom.pointer.count, (count) => count + 1)

function Component() {
  // useVal is a hook that subscribes to changes in a specific path inside the atom
  const ready = useVal(
    // atom.pointer is a type-safe way to refer to a path inside the atom
    atom.pointer.ready,
  )

  if (!ready) {
    return <div>Loading...</div>
  } else {
    return <button onClick={increaseCount}>Increase count</button>
  }
}
```

Alternatively, we could have defined our atom inside the component, making its
state local to that component instance:

```tsx
import {useAtom} form '@theatre/react'

function Component() {
  const atom = useAtom({count: 0, ready: false})
  const ready = useVal(atom.pointer.ready)

  // ...
}
```

## Quick tour

There 4 main concepts in dataverse:

- [Atoms](#atoms), hold the state of your application.
- [Pointers](#pointers) are a type-safe way to refer to specific properties of
  atoms.
- [Prisms](#prisms) are functions that derive a value from an atom or from
  another prism.
- [Tickers](#tickers) are a way to schedule and synchronise computations.

### Atoms

Atoms are state holders. They can be used to manage either component state or
the global state of your application.

```ts
import {Atom} from '@theatre/dataverse'

const atom = new Atom({intensity: 1, position: {x: 0, y: 0}})
```

#### Changing the state of an atom

```ts
// replace the whole stae
atom.set({intensity: 1, position: {x: 0, y: 0}})

// or using an update function
atom.reduce((state) => ({...state, intensity: state.intensity + 1}))

// or much easier, using a pointer
atom.setByPointer(atom.pointer.intensity, 3)

atom.reduceByPointer(atom.pointer.intensity, (intensity) => intensity + 1)
```

#### Reading the state of an atom _None-reactively_

```ts
// get the whole state
atom.get() // {intensity: 4, position: {x: 0, y: 0}}

// or get a specific property using a pointer
atom.getByPointer(atom.pointer.intensity) // 4
```

#### Reading the state of an atom _reactively, in React_

```ts
import {useVal} from '@theatre/react'

function Component() {
  const intensity = useVal(atom.pointer.intensity) // 4
  // ...
}
```

Atoms can also be subscribed to outside of React. We'll cover that in a bit when
we talk about [prisms](#prisms).

### Pointers

Pointers are a type-safe way to refer to specific properties of atoms.

```ts
import {Atom} from '@theatre/dataverse'

const atom = new Atom({intensity: 1, position: {x: 0, y: 0}})

atom.setByPointer(atom.pointer.intensity, 3) // will set the intensity to 3

// referring to a non-existing property is a typescript error, but it'll work at runtime
atom.setByPointer(atom.pointer.nonExistingProperty, 3)

atom.get() // {intensity: 3, position: {x: 0, y: 0}, nonExistingProperty: 3}
```

Pointers are referrentially stable

```ts
assert.equal(atom.pointer.intensity, atom.pointer.intensity)
```

#### Pointers and React

Pointers are a great way to pass data down the component tree while keeping
re-renders only to the components that actually need to re-render.

```tsx
import {useVal, useAtom} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'

function ParentComponent() {
  const atom = useAtom({
    light: {intensity: 1, position: {x: 0, y: 0}},
    ready: true,
  })

  const ready = useVal(atom.pointer.ready)

  if (!ready) return <div>loading...</div>

  return (
    <>
      {/* <Group> will only re-render when the position of the light changes */}
      <Group positionP={atom.pointer.light.position}>
        {/* <Light> will only re-render when the intensity of the light changes */}
        <Light intensityP={atom.pointer.intensity} />
      </Group>
    </>
  )
}

function Group({positionP, children}) {
  const {x, y} = useVal(positionP)
  return <div style={{position: `${x}px ${y}px`}}>{children}</div>
}

function Light({intensityP}) {
  const intensity = useVal(intensityP)
  return <div style={{opacity: intensity}} className="light" />
}
```

### Prisms

Prisms are functions that derive a value from an atom or from another prism.

```ts
import {Atom, prism, val} from '@theatre/dataverse'

const atom = new Atom({a: 1, b: 2, foo: 10})

// the value of this prism will always be equal to the sum of `a` and `b`
const sum = prism(() => {
  const a = val(atom.pointer.a)
  const b = val(atom.pointer.b)
  return a + b
})
```

Prisms can also refer to other prisms.

```ts
const double = prism(() => {
  return 2 * val(sum)
})

console.log(val(double)) // 6
```

#### Reading the value of a prism, _None-reactively_

```ts
console.log(val(prism)) // 3

atom.setByPointer(atom.pointer.a, 2)
console.log(val(prism)) // 4
```

#### Reading the value of a prism, _reactively, in React_

Just like atoms, prisms can be subscribed to via `useVal()`

```tsx
function Component() {
  return (
    <div>
      {useVal(atom.pointer.a)} + {useVal(atom.pointer.b)} = {useVal(prism)}
    </div>
  )
}
```

#### Reading the value of a prism, _reactively, outside of React_

Prisms can also be subscribed to, outside of React's renderloop. This requires
the use of a Ticker, which we'll cover in the next section.

### Tickers

Tickers are a way to schedule and synchronise computations. They're useful when
reacting to changes in atoms or prisms _outside of React's renderloop_.

```ts
import {Ticker, onChange} from '@theatre/dataverse'

const ticker = new Ticker()

// advance the ticker roughly 60 times per second (note that it's better to use requestAnimationFrame)
setInterval(ticker.tick, 1000 / 60)

onChange(atom.pointer.intensity, (newIntensity) => {
  console.log('intensity changed to', newIntensity)
})

atom.setByPointer(atom.pointer.intensity, 3)

// After a few milliseconds, logs 'intensity changed to 3'

setTimeout(() => {
  atom.setByPointer(atom.pointer.intensity, 4)
  atom.setByPointer(atom.pointer.intensity, 5)
  // updates are batched because our ticker advances every 16ms, so we
  // will only get one log for 'intensity changed to 5', even though we changed the intensity twice
}, 1000)
```

Tickers should normally be advanced using `requestAnimationFrame` to make sure
all the computations are done in sync with the browser's refresh rate.

```ts
const frame = () => {
  ticker.tick()
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
```

#### Benefits of using Tickers

Tickers make sure that our computations are batched and only advance atomically.
They also make sure that we don't recompute the same value twice in the same
frame.

Most importantly, Tickers allow us to align our computations to the browser's
(or the XR-device's) refresh rate.

### Prism hooks

Prism hooks are inspired by
[React hooks](https://reactjs.org/docs/hooks-intro.html). They are a convenient
way to cache, memoize, batch, and run effects inside prisms, while ensuring that
the prism can be used in a declarative, encapsulated way.

#### `prism.source()`

The `prism.source()` hook allows a prism to read to and react to changes in
values that reside outside of an atom or another prism, for example, the value
of an `<input type="text" />` element.

```ts
function prismFromInputElement(input: HTMLInputElement): Prism<string> {
  function subscribe(cb: (value: string) => void) {
    const listener = () => {
      cb(input.value)
    }
    input.addEventListener('input', listener)
    return () => {
      input.removeEventListener('input', listener)
    }
  }

  function get() {
    return input.value
  }
  return prism(() => prism.source(subscribe, get))
}

const p = prismFromInputElement(document.querySelector('input'))

p.onChange(ticker, (value) => {
  console.log('input value changed to', value)
})
```

#### `prism.ref()`

Just like React's `useRef()`, `prism.ref()` allows us to create a prism that
holds a reference to some value. The only difference is that `prism.ref()`
requires a key to be passed into it, whlie `useRef()` doesn't. This means that
we can call `prism.ref()` in any order, and we can call it multiple times with
the same key.

```ts
const p = prism(() => {
  const inputRef = prism.ref('some-unique-key')
  if (!inputRef.current) {
    inputRef.current = document.$('input.username')
  }

  // this prism will always reflect the value of <input class="username">
  return val(prismFromInputElement(inputRef.current))
})

p.onChange(ticker, (value) => {
  console.log('username changed to', value)
})
```

#### `prism.memo()`

`prism.memo()` works just like React's `useMemo()` hook. It's a way to cache the
result of a function call. The only difference is that `prism.memo()` requires a
key to be passed into it, whlie `useMemo()` doesn't. This means that we can call
`prism.memo()` in any order, and we can call it multiple times with the same
key.

```ts
import {Atom, prism, val} from '@theatre/dataverse'

const atom = new Atom(0)

function factorial(n: number): number {
  if (n === 0) return 1
  return n * factorial(n - 1)
}

const p = prism(() => {
  // num will be between 0 and 9. This is so we can test what happens when the atom's value changes, but
  // the memoized value doesn't change.
  const num = val(atom.pointer)
  const numMod10 = num % 10
  const value = prism.memo(
    // we need a string key to identify the hook. This allows us to call `prism.memo()` in any order, or even conditionally.
    'factorial',
    // the function to memoize
    () => {
      console.log('Calculating factorial')
      factorial(numMod10)
    },
    // the dependencies of the function. If any of the dependencies change, the function will be called again.
    [numMod10],
  )

  return `number is ${num}, num % 10 is ${numMod10} and its factorial is ${value}`
})

p.onChange(ticker, (value) => {
  console.log('=>', value)
})

atom.set(1)
// Calculating factorial
// => number is 1, num % 10 is 1 and its factorial is 1

atom.set(2)
// Calculating factorial
// => number is 2, num % 10 is 2 and its factorial is 2

atom.set(12) // won't recalculate the factorial
// => number is 12, num % 10 is 2 and its factorial is 2
```

#### `prism.effect()` and `prism.state()`

These are two more hooks that are similar to React's `useEffect()` and
`useState()` hooks.

`prism.effect()` is similar to React's `useEffect()` hook. It allows us to run
side-effects when the prism is calculated. Note that prisms are supposed to be
"virtually" pure functions. That means they either should not have side-effects
(and thus, no calls for `prism.effect()`), or their side-effects should clean
themselves up when the prism goes cold.

`prism.state()` is similar to React's `useState()` hook. It allows us to create
a stateful value that is scoped to the prism.

We'll defer to React's documentation for
[a more detailed explanation of how `useEffect()`](https://reactjs.org/docs/hooks-effect.html)
and how [`useState()`](https://reactjs.org/docs/hooks-state.html) work. But
here's a quick example:

```tsx
import {prism} from '@theatre/dataverse'
import {useVal} from '@theatre/react'

// This prism holds the current mouse position and updates when the mouse moves
const mousePositionPr = prism(() => {
  const [pos, setPos] = prism.state<[x: number, y: number]>('pos', [0, 0])

  prism.effect(
    'setupListeners',
    () => {
      const handleMouseMove = (e: MouseEvent) => {
        setPos([e.screenX, e.screenY])
      }
      document.addEventListener('mousemove', handleMouseMove)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    },
    [],
  )

  return pos
})

function Component() {
  const [x, y] = useVal(mousePositionPr)
  return (
    <div>
      Mouse position: {x}, {y}
    </div>
  )
}
```

#### `prism.sub()`

`prism.sub()` is a shortcut for creating a prism inside another prism. It's
equivalent to calling `prism.memo(key, () => prism(fn), deps).getValue()`.
`prism.sub()` is useful when you want to divide your prism into smaller prisms,
each of which would _only_ recalculate when _certain_ dependencies change. In
other words, it's an optimization tool.

```ts
function factorial(num: number): number {
  if (num === 0) return 1
  return num * factorial(num - 1)
}

const events: Array<'foo-calculated' | 'bar-calculated'> = []

// example:
const state = new Atom({foo: 0, bar: 0})
const pr = prism(() => {
  const resultOfFoo = prism.sub(
    'foo',
    () => {
      events.push('foo-calculated')
      const foo = val(state.pointer.foo) % 10
      // Note how `prism.sub()` is more powerful than `prism.memo()` because it allows us to use `prism.memo()` and other hooks inside of it:
      return prism.memo('factorial', () => factorial(foo), [foo])
    },
    [],
  )
  const resultOfBar = prism.sub(
    'bar',
    () => {
      events.push('bar-calculated')
      const bar = val(state.pointer.bar) % 10

      return prism.memo('factorial', () => factorial(bar), [bar])
    },
    [],
  )

  return `result of foo is ${resultOfFoo}, result of bar is ${resultOfBar}`
})

const unsub = pr.onChange(ticker, () => {})
// on the first run, both subs should be calculated:
console.log(events) // ['foo-calculated', 'bar-calculated']
events.length = 0 // clear the events array

// now if we change the value of `bar`, only `bar` should be recalculated:
state.setByPointer(state.pointer.bar, 2)
pr.getValue()
console.log(events) // ['bar-calculated']

unsub()
```

since prism hooks are keyed (as opposed to React hooks where they're identified
by their order), it's possible to have multiple hooks with the same key in the
same prism. To avoid this, we can use `prism.scope()` to create a "scope" for
our hooks. Example:

```ts
const pr = prism(() => {
  prism.scope('a', () => {
    prism.memo('foo', () => 1, [])
  })

  prism.scope('b', () => {
    prism.memo('foo', () => 1, [])
  })
})
```

### `usePrism()`

`usePrism()` is a _React_ hook that allows us to create a prism inside a React
component. This way, we can optimize our React components in a fine-grained way
by moving their computations outside of React's render loop.

```tsx
import {usePrism} from '@theatre/react'

function Component() {
  const value = usePrism(() => {
    // [insert heavy calculation here]
  }, [])
}
```

### Hot and cold prisms

Prisms can have three states:

- 🧊 Cold: The prism was just created. It does not have dependents, or its
  dependents are also 🧊 cold.
- 🔥 Hot: The prism is either being subscribed to (via `useVal()`,
  `prism.onChange()`, `prism.onStale()`, etc). Or, one of its dependents is 🔥
  hot.
  - A 🔥 Hot prism itself has two states:
    - 🪵 Stale: The prism is hot, but its value is stale. This happens when one
      or more of its dependencies have changed, but the value of the prism
      hasn't been read since that change. Reading the value of a 🪵 Stale prism
      will cause it to recalculate, and make it 🌲 Fresh.
    - 🌲 Fresh: The prism is hot, and its value is fresh. This happens when the
      prism's value has been read since the last change in its dependencies.
      Re-reading the value of a 🌲 Fresh prism will _not_ cause it to
      recalculate.

Or, as a typescript annotation:

```ts
type PrismState =
  | {isHot: false} // 🧊
  | {isHot: true; isFresh: false} // 🔥🪵
  | {isHot: true; isFresh: true} // 🔥🌲
```

Let's demonstrate this with an example of a prism, and its `onStale()` method.

```ts
const atom = new Atom(0)
const a = prism(() => val(atom.pointer)) // 🧊

// onStale(cb) calls `cb` when the prism goes from 🌲 to 🪵
a.onStale(() => {
  console.log('a is stale')
})
// a from 🧊 to 🔥
// console: a is stale

// reading the value of `a` will cause it to recalculate, and make it 🌲 fresh.
console.log(val(a)) // 1
// a from 🔥🪵 to 🔥🌲

atom.set(1)
// a from 🔥🌲 to 🔥🪵
// console: a is stale

// reading the value of `a` will cause it to recalculate, and make it 🌲 fresh.
console.log(val(a)) // 2
```

Prism states propogate through the prism dependency graph. Let's look at an
example:

```ts
const atom = new Atom({a: 0, b: 0})
const a = prism(() => val(atom.pointer.a))
const b = prism(() => val(atom.pointer.b))
const sum = prism(() => val(a) + val(b))

//    a    |    b    |   sum    |
//    🧊   |    🧊    |    🧊    |

let unsub = a.onStale(() => {})

// there is now a subscription to `a`, so it's 🔥 hot
//    a    |    b    |   sum    |
//    🔥🪵  |    🧊   |    🧊    |

unsub()
// there are no subscriptions to `a`, so it's 🧊 cold again
//    a    |    b    |   sum    |
//    🧊   |    🧊    |    🧊    |

unsub = sum.onStale(() => {})
// there is now a subscription to `sum`, so it goes 🔥 hot, and so do its dependencies
//    a    |    b    |   sum    |
//    🔥🪵  |    🔥🪵  |    🔥🪵  |

val(sum)
// reading the value of `sum` will cause it to recalculate, and make it 🌲 fresh.
//    a    |    b    |   sum    |
//    🔥🌲  |    🔥🌲  |    🔥🌲  |

atom.setByPointer(atom.pointer.a, 1)
// `a` is now stale, which will cause `sum` to become stale as well
//    a    |    b    |   sum    |
//    🔥🪵  |    🔥🌲  |    🔥🪵  |

val(a)
// reading the value of `a` will cause it to recalculate, and make it 🌲 fresh. But notice that `sum` is still 🪵 stale.
//    a    |    b    |   sum    |
//    🔥🌲  |    🔥🌲  |    🔥🪵  |

atom.setByPointer(atom.pointer.b, 1)
// `b` now goes stale. Since sum was already stale, it will remain so
//    a    |    b    |   sum    |
//    🔥🌲  |    🔥🪵  |    🔥🪵  |

val(sum)
// reading the value of `sum` will cause it to recalculate and go 🌲 fresh.
//    a    |    b    |   sum    |
//    🔥🌲  |    🔥🌲  |    🔥🌲  |

unsub()
// there are no subscriptions to `sum`, so it goes 🧊 cold again, and so do its dependencies, since they don't have any other hot dependents
//    a    |    b    |   sum    |
//    🧊   |    🧊    |    🧊    |
```

The state transitions propogate in topological order. Let's demonstrate this by
adding one more prism to our dependency graph:

```ts
// continued from the previous example

const double = prism(() => val(sum) * 2)

// Initially, all prisms are 🧊 cold
//    a    |    b    |   sum    |  double  |
//    🧊   |    🧊    |    🧊    |    🧊    |

let unsub = double.onStale(() => {})
// here is how the state transitions will happen, step by step:
// (step)   |   a    |    b    |   sum    |  double  |
//    1     |   🧊   |    🧊    |    🧊    |    🔥🪵   |
//    2     |   🧊   |    🧊    |   🔥🪵   |    🔥🪵   |
//    3     |   🔥🪵  |   🔥🪵   |   🔥🪵   |    🔥🪵   |

val(double)
// freshening happens in the reverse order
// (step)   |   a    |    b    |   sum    |  double  |
//    0     |   🔥🪵  |   🔥🪵  |   🔥🪵    |    🔥🪵   |
// --------------------------------------------------|
//    1                              ▲         ▼     | double reads the value of sum
//                                   └────◄────┘     |
// --------------------------------------------------|
//    2          ▲        ▲          ▼               | sum reads the value of a and b
//               │        │          │               |
//               └────◄───┴────◄─────┘               |
// --------------------------------------------------|
//    3     |   🔥🌲  |   🔥🌲  |   🔥🪵    |    🔥🪵   | a and b go fresh
// --------------------------------------------------|
//    4     |   🔥🌲  |   🔥🌲  |   🔥🌲    |    🔥🪵   | sum goes fresh
// --------------------------------------------------|
//    5     |   🔥🌲  |   🔥🌲  |   🔥🌲    |    🔥🌲   | double goes fresh
// --------------------------------------------------|
```

## Links

- [API Reference](./api/README.md)
- [The exhaustive guide to dataverse](./src/dataverse.test.ts)
- It's also fun to
  [open the monorepo](https://github1s.com/theatre-js/theatre/blob/main/packages/dataverse/src/index.ts)
  in VSCode and look up references to `Atom`, `prism()` and other dataverse
  methods. Since dataverse is used internally in Theatre.js, there are a lot of
  examples of how to use it.
- Also see [`@theatre/react`](../react/README.md) to learn more about the React
  bindings.

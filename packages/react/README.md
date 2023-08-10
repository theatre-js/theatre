# @theatre/react

Utilities for using [Theatre.js](https://www.theatrejs.com) or
[Dataverse](https://github.com/theatre-js/theatre/tree/main/packages/dataverse)
with React.

## Documentation

### `useVal(pointerOrPrism)`

A React hook that returns the value of the given prism or pointer.

Usage with Dataverse pointers:

```tsx
import {Atom} from '@theatre/dataverse'
import {useVal} from '@theatre/react'

const atom = new Atom({foo: 'foo'})

function Component() {
  const foo = useVal(atom.pointer.foo)
  return <div>{foo}</div>
}
```

Usage with Dataverse prisms:

```tsx
import {prism} from '@theatre/dataverse'
import {useVal} from '@theatre/react'

const pr = prism(() => 'some value')

function Component() {
  const value = useVal(pr)
  return <div>{value}</div>
}
```

Usage with Theatre.js pointers:

```tsx
import {useVal} from '@theatre/react'
import {getProject} from '@theatre/core'

const obj = getProject('my project')
  .sheet('my sheet')
  .object('my object', {foo: 'default value of props.foo'})

function Component() {
  const value = useVal(obj.props.foo)
  return <div>obj.foo is {value}</div>
}
```

_Note that `useVal()` is a React hook, so it can only be used inside a React
component's render function. `val()` on the other hand, can be used either
inside a `prism` (which would be reactive) or anywhere where reactive values are
not needed._

### `usePrism(fn, deps)`

Creates a prism out of `fn` and subscribes the element to the value of the
created prism.

```tsx
import {Atom, val, prism} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'

const state = new Atom({a: 1, b: 1})

function Component(props: {which: 'a' | 'b'}) {
  const value = usePrism(
    () => {
      prism.isPrism() // true
      // note that this function is running inside a prism, so all of prism's
      // hooks (prism.memo(), prism.effect(), etc) are available
      const num = val(props.which === 'a' ? state.pointer.a : state.pointer.b)
      return doExpensiveComputation(num)
    },
    // since our prism reads `props.which`, we should include it in the deps array
    [props.which],
  )
  return <div>{value}</div>
}
```

> Note that just like `useMemo(..., deps)`, it's necessary to provide a `deps`
> array to `usePrism()`.

### `usePrismInstance(prismInstance)`

Subscribes the element to the value of the given prism instance.

```tsx
import {Atom, val, prism} from '@theatre/dataverse'
import {usePrismInstance} from '@theatre/react'

const state = new Atom({a: 1, b: 1})

const p = prism(() => {
  return val(state.pointer.a) + val(state.pointer.b)
})

function Component() {
  const value = usePrismInstance(p)
  return <div>{value}</div>
}
```

### `useAtom(initialValue)`

/\*\* Creates a new Atom, similar to useState(), but the component won't
re-render if the value of the atom changes.

```tsx
import {useAtom, useVal} from '@theatre/react'
import {useEffect} from 'react'

function MyComponent() {
  const atom = useAtom({count: 0, ready: false})

  const onClick = () =>
    atom.setByPointer(
      (p) => p.count,
      (count) => count + 1,
    )

  useEffect(() => {
    setTimeout(() => {
      atom.setByPointer((p) => p.ready, true)
    }, 1000)
  }, [])

  const ready = useVal(atom.pointer.ready)
  if (!ready) return <div>Loading...</div>
  return <button onClick={onClick}>Click me</button>
}
```

## Links

- Learn more about [Dataverse](../dataverse/README.md)

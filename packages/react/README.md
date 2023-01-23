# @theatre/react

Utilities for using [Theatre.js](https://www.theatrejs.com) or [Dataverse](https://github.com/theatre-js/theatre/tree/main/packages/dataverse) with React.

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

const obj = getProject('my project').sheet('my sheet').object('my object', {foo: 'default value of props.foo'})

function Component() {
  const value = useVal(obj.props.foo)
  return <div>obj.foo is {value}</div>
}
```

_Note that `useVal()` is a React hook, so it can only be used inside a React component's render function. `val()` on the other hand, can be used either inside a `prism` (which would be reactive) or anywhere where reactive values are not needed._

### `usePrism(fn, deps)`

Creates a prism out of `fn` and subscribes the element to the value of the created prism.

```tsx
import {Atom, val, prism} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'

const state = new Atom({a: 1, b: 1})

function Component(props: {which: 'a' | 'b'}) {
  const value = usePrism(() => {
    prism.isPrism() // true
    // note that this function is running inside a prism, so all of prism's
    // hooks (prism.memo(), prism.effect(), etc) are available
    const num = val(props.which === 'a' ? state.pointer.a : state.pointer.b)
    return doExpensiveComputation(num)
  }, 
  // since our prism reads `props.which`, we should include it in the deps array
  [props.which]
  )
  return <div>{value}</div>
}
```

> Note that just like `useMemo(..., deps)`, it's necessary to provide a `deps` array to `usePrism()`.
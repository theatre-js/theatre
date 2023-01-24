An easy to use Tweakpane/Leva-like library for React, built on top of
Theatre.js.

You can use Theatric to quickly tweak values in your React components, or create
quick prototypes without worrying about setting up a UI.

Unlike Leva or Tweakpane, Theatric can save or export the state of your controls
and load it back in later. You can even share the state with other people, so
they can see the same values you're seeing, or leave Theatric's `useControls`
hooks in production, and let Theatric set the values from the provided state
without displaying the UI.

Since Theatric is built on top of Theatre.js, you can also animate all the
values.

It comes with no peer-dependencies, all you need to do to set it up is run
`yarn add theatric` or `npm install theatric`.

## API

[`useControls(controls, options?)`](#usecontrolscontrols-options)

[`initialize(config)`](#initializeconfig)

[`types`](#types)

### `useControls(controls, options?)`

`useControls` is Theatric's main API. It is a React hook which you can call from
anywhere in your component tree. It takes an object of controls and returns an
object of values.

```tsx
import {useControls} from 'theatric'

function Introduction() {
  const {name, age} = useControls({name: 'Andrew', age: 28})

  return (
    <div>
      Hey, I'm {name} and I'm {age} years old.
    </div>
  )
}
```

Optionally, you can also provide a folder option in the options argument, which
will namespace your controls to that folder in the UI. This is useful if you
have multiple instances of the same component, in which case the controls would
collide.

```tsx
import {useControls} from 'theatric'

function Introduction({id}) {
  const {name, age} = useControls({name: 'Andrew', age: 28}, {folder: id})

  return (
    <div>
      Hey, I'm {name} and I'm {age} years old.
    </div>
  )
}
```

`useControls` also returns two special properties, `$get` and `$set`, which you
can use to get and set the values of your controls imperatively.

```tsx
import {useControls} from 'theatric'

function Introduction() {
  const {name, age, $get, $set} = useControls({name: 'Andrew', age: 28})

  const increaseAge = useCallback(() => {
    $set((values) => values.age, $get((values) => values.age) + 1)
  }, [$get, $set])

  return (
    <div>
      <div>
        Hey, I'm {name} and I'm {age} years old.
      </div>
      <button onClick={increaseAge}>Increase age</button>
    </div>
  )
}
```

You can also place buttons on the control panel to trigger actions. You can
combine this with the `$get` and `$set` methods to create a more convenient UI.

```tsx
import {useControls, button} from 'theatric'

function Introduction() {
  const {name, age, $get, $set} = useControls({
    name: 'Andrew',
    age: 28,
    IncrementAge: button(() => {
      $set((values) => values.age, $get((values) => values.age) + 1)
    }),
  })

  return (
    <div>
      <div>
        Hey, I'm {name} and I'm {age} years old.
      </div>
    </div>
  )
}
```

### `initialize(config)`

Optionally, you can call `initialize()` to initialize the UI with a certain
state, or to take advantage of features like
[assets](/docs/latest/manual/assets) support. `initialize()` takes the same
config object as [`getProject`](/docs/latest/api/core#getproject_id-config_).

```tsx
import {initialize, useControls} from 'theatric'
import theatricState from './theatricState.json'

initialize({
  state: theatricState,
  assets: {
    // Defaults to '/'
    baseUrl: '/theatric-assets',
  },
})
```

### `types`

The `types` export lets you provide more advanced options for your controls.

For example, to specify a range for a number, or adjust the scrubbing
sensitivity, you can use the `number` type.

```tsx
import {useControls, types} from 'theatric'

function Introduction() {
  const {name, age} = useControls({
    name: 'Andrew',
    age: types.number(28, {
      // The range allowed in the UI (just a visual guide, not a validation rule)
      range: [0, 10],
      // Factor influencing the mouse-sensitivity when scrubbing the input
      nudgeMultiplier: 0.1,
    }),
  })

  return (
    <div>
      Hey, I'm {name} and I'm {age} years old.
    </div>
  )
}
```

To learn more about types, check out the
[types documentation](/docs/latest/api/core#prop-types).

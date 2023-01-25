An easy to use [Tweakpane](https://cocopon.github.io/tweakpane/)/[Leva](https://github.com/pmndrs/leva)-like library for React, built on top of
[Theatre.js](github.com/theatre-js/theatre).

With Theatric you can:

* Create controls for your React components.
* Tweak those values while while your tweaks are persisted in the browser.
* Undo/redo your tweaks, even after a page refresh.
* Try out different assets (such as `.hdr` files), and once you're done, download your assets from the browser storage and put them in a static folder in your app.

## Quick start

```bash
$ npm install theatric
```

```tsx
// index.jsx
ReactDOM.render(<App />, document.getElementById('root'))

// App.jsx
import {useControls} from 'theatric'
import React from 'react'

export default function App() {
  const {name, age} = useControls({name: 'Andrew', age: 28})

  return (
    <div>
      Hey, I'm {name} and I'm {age} years old.
    </div>
  )
}
```

## Supported prop types

Theatric supports all the prop types that Theatre.js supports. You can find a list of supported prop types [here](https://www.theatrejs.com/docs/latest/manual/prop-types).

## Using assets

Here is an example of using image assets in your controls. Learn more about assets [here](https://www.theatrejs.com/docs/latest/manual/assets).

```tsx
import {initialize, useControls, types, getAssetUrl} from 'theatric'
import theatricState from './theatricState.json'

initialize({
  // if you're using assets in your controls, you can specify the base URL here.
  
  assets: {
    // Defaults to '/'
    // If you host your assets on a different domain, you can specify it here.
    // For example if you're hosting your assets on https://cdn.example.com/theatric-assets
    // you can set this to 'https://cdn.example.com/theatric-assets' (no trailing slash)
    baseUrl: '/theatric-assets',
  },
}).then(() => {
  // this is only necessary if you're using assets such as .hdr images in your prop values.
  // awaiting the initialization ensures that the assets are loaded before rendering the app.
  ReactDOM.render(<App />, document.getElementById('root'))
})

function App() {
  const {img} = useControls({
    // this will accept jpegs/pngs/hdrs/etc
    // its default value is '' (empty string)
    // learn more about assets here: https://www.theatrejs.com/docs/latest/manual/assets
    img: types.image('')
  })

  const src = getAssetUrl(img)

  return (
    <div>
      <img src={src} />
    </div>
  )
}
```

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

`$get()` and `$set()` use pointers to specify which prop to get/set. Learn more about pointers [here](https://www.theatrejs.com/docs/latest/api/core#pointers).

Example of setting a nested prop:

```tsx
import {useControls, button} from 'theatric'

function Introduction() {
  const {person, $get, $set} = useControls({
    // note how name and age are sub-props of person
    person: {
      name: 'Andrew',
      age: 28,
    },
    
    IncrementAge: button(() => {
      // values.person.age is a pointer to the age prop of the person object
      $set((values) => values.person.age, $get((values) => values.person.age) + 1)
    }),
  })

  return (
    <div>
      <div>
        Hey, I'm {person.name} and I'm {person.age} years old.
      </div>
    </div>
  )
}
```

### `initialize(config)`

Optionally, you can call `initialize()` to initialize the UI with a certain
state, or to take advantage of features like
[assets](https://www.theatrejs.com/docs/latest/manual/assets) support. `initialize()` takes the same
config object as [`getProject()`](https://www.theatrejs.com/docs/latest/api/core#getproject_id-config_).


```tsx
import {initialize, useControls, types, getAssetUrl} from 'theatric'
import theatricState from './theatricState.json'

initialize({
  // use the state of the state.json file you exported from the UI
  state: theatricState,
}).then(() => {
  // theatric is ready (although we don't have to wait for it unless we want to use assets)
})
  
ReactDOM.render(<App />, document.getElementById('root'))

function App() {
  const {img} = useControls({
    name: 'Andrew',
    age: types.number(28, {
      range: [0, 150],
    }),
  })
  

  return (
    <div>
      Hey, I'm {name} and I'm {age} years old.
    </div>
  )
}
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

This is simply a re-export via `export {types} from '@theatre/core'`. To learn more about types, check out the
[types documentation](https://www.theatrejs.com/docs/latest/manual/prop-types).

## How does Theatric compare to Theatre.js?

* You can use both Theatric and Theatre.js in the same project. That's a common use-case.
* You'd use Theatre.js if you're creating complex animation, or if you have large projects with many objects and props to control.
* On the other hand, if you're just looking for a quick way to tweak a few values in your app, Theatric is a good choice. It requires no setup, no configuration, and no boilerplate. All of your values end up in a single Theatre.js [Object](https://www.theatrejs.com/docs/latest/manual/objects).

## License

Apache License Version 2.0. Theatric only embeds Theatre.js' studio in the development build, so studio won't be included in your production build.
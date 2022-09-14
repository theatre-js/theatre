# @theatre/r3f

A [Theatre.js](https://github.com/AriaMinaei/theatre) extension for [THREE.js](https://threejs.org/) with [React Three Fiber](https://github.com/pmndrs/react-three-fiber).

**Here be dragons! 🐉** `@theatre/r3f` is pre-release software, the API, the internal logic, and even the package name can and will drastically change at any time, without warning.

## Quickstart

```bash
# r3f and its deps
yarn add react
yarn add three
yarn add @react-three/fiber

# Theatre.js
yarn add @theatre/core
yarn add @theatre/studio

yarn add @theatre/r3f
```

```tsx
import React from 'react';
import { Canvas } from 'react-three-fiber';
import {editable as e, SheetProvider, extension} from '@theatre/r3f';
import studio from '@theatre/studio';

studio.extend(extension)
studio.initialize()

export default function App() {
  return (
    <Canvas>
      <SheetProvider
        sheet={getProject('Playground - R3F').sheet('R3F-Canvas')}
      >
          <ambientLight intensity={0.5} />
          {/* Mark objects as editable. */}
          {/* Properties in the code are used as initial values and reset points in the editor. */}
          <e.spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            theatreKey="Spotlight"
          />
          <e.pointLight theatreKey="PointLight" />
          <e.mesh theatreKey="Box">
            <boxBufferGeometry />
            <meshStandardMaterial color="orange" />
          </e.mesh>
      </SheetProvider>
    </Canvas>
  );
}
```

## Why

When creating a 3D scene for react-three-fiber, you can choose two routes: you can either code it in r3f, which gives you reactivity, and the flexibility that comes with it, or you can use a 3D software like Blender and export it, but then if you want to dynamically modify that scene at runtime, you'll have to fall back to imperative code.

The best middle ground so far has been *gltfjsx*, which generates JSX from your exported scene, however it still involves a lot of manual work if you want to split your scene into components, and any modifications you make will have to be reapplied if you make changes to the scene.

`@theatre/r3f` aims to fill this gap by allowing you to set up your scene in JSX, giving you reactivity, while allowing you to tweak the properties of these objects in a visual editor, including their transforms, which you can then bake into a json file to be used by the runtime in production. An explicit goal of the project is to mirror regular react-three-fiber code as much as possible. This lets you add it to an existing project with ease, take it out when you don't need it, and generally use it as little or as much as you want, without feeling locked in.

## API

### `editable`

Use it to make objects editable. The properties on `editable` mirror the intrinsic elements of react-three-fiber, however there's no full parity yet. E.g. if you want to create an editable `<mesh>`, you do it by using `<editable.mesh>` instead. These elements have the same interface as the normal ones, with the addition of the below props. Any editable property you set in the code (like `position`) will be used as an initial value/reset point in the editor.

`editable` is also a function, which allows you to make your custom components editable. Your component does have to be compatible with the interface of the editable object type it is meant to represent. You need to pass it the component you want to wrap, and the object type it represents (see object types).

```ts
import { editable } from '@theatre/r3f';
import { PerspectiveCamera } from '@react-three/drei';

const EditableCamera = editable(PerspectiveCamera, 'perspectiveCamera');
```

#### Props

`theatreKey: string`: a unique name used to identify the object in the editor.

### `<SheetProvider sheet={...} />`

Provider component you need to wrap any scene with that you use editable components in.

#### Props

`sheet: TheatreSheetObject`: A function that returns the Theatre.js sheet associated with the scene.

## Object types

React Three Editable currently supports the following object types:

- group
- mesh
- spotLight
- directionalLight
- pointLight
- perspectiveCamera
- orthographicCamera

These are available as properties of `editable`, and you need to pass them as the second parameter when wrapping custom components.

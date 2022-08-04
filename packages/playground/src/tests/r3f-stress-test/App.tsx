import {editable as e, RefreshSnapshot, SheetProvider} from '@theatre/r3f'
import {Stars} from '@react-three/drei'
import {getProject, types} from '@theatre/core'
import React, {Suspense, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {useGLTF, PerspectiveCamera} from '@react-three/drei'
import sceneGLB from './scene.glb'

import state from './SpaceStress.theatre-project-state.json'

document.body.style.backgroundColor = '#171717'

const EditableCamera = e(PerspectiveCamera, 'perspectiveCamera')

function Model({url}: {url: string}) {
  const {nodes} = useGLTF(url) as any

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} scale={7}>
      <group rotation={[Math.PI / 13.5, -Math.PI / 5.8, Math.PI / 5.6]}>
        <e.mesh
          uniqueName="Example Namespace / Thingy"
          receiveShadow
          castShadow
          geometry={nodes.planet001.geometry}
          material={nodes.planet001.material}
        />
        <e.mesh
          uniqueName="Example Namespace / Debris 2"
          receiveShadow
          castShadow
          geometry={nodes.planet002.geometry}
          material={nodes.planet002.material}
        />
        <e.mesh
          uniqueName="Debris 1"
          geometry={nodes.planet003.geometry}
          material={nodes.planet003.material}
        />
      </group>
    </group>
  )
}

// Initially, just copied from the shared/dom example
const textInterpolate = (left: string, right: string, progression: number) => {
  if (!left || right.startsWith(left)) {
    const length = Math.floor(
      Math.max(0, (right.length - left.length) * progression),
    )
    return left + right.slice(left.length, left.length + length)
  }
  return left
}

const allPropsObjectConfig = {
  test: types.string('Typing', {interpolate: textInterpolate}),
  testLiteral: types.stringLiteral('a', {a: 'Option A', b: 'Option B'}),
  bool: types.boolean(false),
  favoriteFood: types.compound({
    name: types.string('Pie'),
    // if needing more compounds, consider adding weight with different units
    price: types.compound({
      currency: types.stringLiteral('USD', {USD: 'USD', EUR: 'EUR'}),
      amount: types.number(10, {range: [0, 1000], label: '$'}),
    }),
  }),
  x: types.number(200),
  y: types.number(200),
  color: types.rgba({r: 1, g: 0, b: 0, a: 1}),
}

function App() {
  const bgs = ['#272730', '#b7c5d1']
  const [bgIndex, setBgIndex] = useState(0)
  const bg = bgs[bgIndex]
  const project = getProject('SpaceStress', {state})
  const sheet = project.sheet('Scene')
  project.ready.then(() => sheet.sequence.play({iterationCount: Infinity}))

  const allPropsObj = sheet.object('All Props Tester', allPropsObjectConfig)
  console.log('allPropsObj', allPropsObj)

  return (
    <div
      onClick={() => {
        // return setBgIndex((bgIndex) => (bgIndex + 1) % bgs.length)
      }}
      style={{
        height: '100vh',
      }}
    >
      <Canvas
        dpr={[1.5, 2]}
        linear
        shadows
        gl={{preserveDrawingBuffer: true}}
        frameloop="demand"
      >
        <SheetProvider sheet={sheet}>
          <fog attach="fog" args={[bg, 16, 30]} />
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.75} />
          <EditableCamera
            uniqueName="Camera"
            makeDefault
            position={[0, 0, 16]}
            fov={75}
          >
            <e.pointLight
              uniqueName="Light 1"
              intensity={1}
              position={[-10, -25, -10]}
            />
            <e.spotLight
              uniqueName="Light 2"
              castShadow
              intensity={2.25}
              angle={0.2}
              penumbra={1}
              position={[-25, 20, -15]}
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0001}
            />
            <e.directionalLight uniqueName="Light 3" />
          </EditableCamera>
          <Suspense fallback={null}>
            <RefreshSnapshot />
            <Model url={sceneGLB} />
          </Suspense>
          <Stars radius={500} depth={50} count={1000} factor={10} />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

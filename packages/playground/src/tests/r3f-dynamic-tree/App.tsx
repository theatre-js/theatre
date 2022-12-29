import {editable as e, SheetProvider} from '@theatre/r3f'
import {getProject} from '@theatre/core'
import React, {useEffect, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {PerspectiveCamera} from '@react-three/drei'
import {useExtensionButton} from '../../shared/utils/useExtensionButton'

document.body.style.backgroundColor = '#171717'

const EditableCamera = e(PerspectiveCamera, 'perspectiveCamera')

function App() {
  const project = getProject('R3F Hot Reload Test')
  const sheet = project.sheet('Scene')

  return (
    <div
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
          <EditableCamera
            theatreKey="Camera"
            makeDefault
            position={[0, 0, 16]}
            fov={75}
          >
            <Scene />
          </EditableCamera>
        </SheetProvider>
      </Canvas>
    </div>
  )
}

// initial config of "Cube 1"
const cube1Config1 = {a: 1}
// we change the default value of a, and add a new prop
const cube1Config2 = {a: 2, b: 2}
// we re-use the previous config
const cube1Config3 = cube1Config2

function Scene() {
  const [state, setState] = useState(1)

  useExtensionButton('Step forward', () => {
    setState((s) => s + 1)
  })

  useEffect(() => {}, [])

  if (state === 1) {
    return (
      <e.mesh theatreKey="Cube 1" additionalProps={cube1Config1}>
        <boxGeometry args={[10, 10, 10]} />
      </e.mesh>
    )
  } else if (state === 2) {
    return (
      <>
        <e.mesh theatreKey="Cube 1" additionalProps={cube1Config2}>
          <boxGeometry args={[10, 10, 10]} />
        </e.mesh>
        <e.mesh theatreKey="Cube 2">
          <boxGeometry args={[20, 20, 10]} />
        </e.mesh>
      </>
    )
  } else if (state === 3) {
    return (
      <e.mesh theatreKey="Cube 1" additionalProps={cube1Config3}>
        <boxGeometry args={[10, 10, 10]} />
      </e.mesh>
    )
  } else {
    return null
  }
}

export default App

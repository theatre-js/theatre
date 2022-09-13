import {getProject} from '@theatre/core'
import React from 'react'
import {Canvas} from '@react-three/fiber'
import studio from '@theatre/studio'
import {editable as e, SheetProvider} from '@theatre/r3f'
import extension from '@theatre/r3f/dist/extension'

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  studio.extend(extension)
  studio.initialize({usePersistentStorage: false})
}

// credit: https://codesandbox.io/s/camera-pan-nsb7f

function Plane({color, uniqueName, ...props}) {
  return (
    <e.mesh {...props} uniqueName={uniqueName}>
      <boxBufferGeometry />
      <meshStandardMaterial color={color} />
    </e.mesh>
  )
}

function App() {
  return (
    <Canvas
      gl={{preserveDrawingBuffer: true}}
      linear
      frameloop="demand"
      dpr={[1.5, 2]}
      style={{position: 'absolute', top: 0, left: 0}}
    >
      <SheetProvider sheet={getProject('Playground - R3F').sheet('R3F-Canvas')}>
        {/* @ts-ignore */}
        <e.orthographicCamera makeDefault uniqueName="Camera" />
        <ambientLight intensity={0.4} />
        <e.pointLight
          position={[-10, -10, 5]}
          intensity={2}
          color="#ff20f0"
          uniqueName="Light 1"
        />
        <e.pointLight
          position={[0, 0.5, -1]}
          distance={1}
          intensity={2}
          color="#e4be00"
          uniqueName="Light 2"
        />
        <group position={[0, -0.9, -3]}>
          <Plane
            color="hotpink"
            rotation-x={-Math.PI / 2}
            position-z={2}
            scale={[4, 20, 0.2]}
            uniqueName="plane1"
          />
          <Plane
            color="#e4be00"
            rotation-x={-Math.PI / 2}
            position-y={1}
            scale={[4.2, 0.2, 4]}
            uniqueName="plane2"
          />
          <Plane
            color="#736fbd"
            rotation-x={-Math.PI / 2}
            position={[-1.7, 1, 3.5]}
            scale={[0.5, 4, 4]}
            uniqueName="plane3"
          />
          <Plane
            color="white"
            rotation-x={-Math.PI / 2}
            position={[0, 4.5, 3]}
            scale={[2, 0.03, 4]}
            uniqueName="plane4"
          />
        </group>
      </SheetProvider>
    </Canvas>
  )
}

const project = getProject('Project')
const sheet = project.sheet('Sheet')
const obj = sheet.object('Obj', {str: 'some string', num: 0})

export default function Home() {
  return <App obj={obj}>hi</App>
}

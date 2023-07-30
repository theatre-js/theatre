import {getProject} from '@theatre/core'
import React, {useEffect, useRef} from 'react'
import {Canvas} from '@react-three/fiber'
import {editable as e, SheetProvider, PerspectiveCamera} from '@theatre/r3f'
import state from './state.json'

// credit: https://codesandbox.io/s/camera-pan-nsb7f

function Plane({color, theatreKey, ...props}: any) {
  return (
    <e.mesh {...props} theatreKey={theatreKey}>
      <boxBufferGeometry />
      <meshStandardMaterial color={color} />
    </e.mesh>
  )
}

export default function App() {
  const light2Ref = useRef<any>()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!light2Ref.current) return

      clearInterval(interval)

      const intensityInStateJson = 3
      const currentIntensity = light2Ref.current.intensity
      if (currentIntensity !== intensityInStateJson) {
        console.error(`Test failed: light2.intensity is ${currentIntensity}`)
      } else {
        console.log(`Test passed: light2.intensity is ${intensityInStateJson}`)
      }
    }, 50)
    // see the note on <e.pointLight theatreKey="Light 2" /> below to understand why we're doing this
  }, [])

  return (
    <Canvas
      gl={{preserveDrawingBuffer: true}}
      linear
      frameloop="demand"
      dpr={[1.5, 2]}
      style={{position: 'absolute', top: 0, left: 0}}
    >
      <SheetProvider
        sheet={getProject('Playground - R3F', {state}).sheet('R3F-Canvas')}
      >
        {/* @ts-ignore */}
        <PerspectiveCamera makeDefault theatreKey="Camera" />
        <ambientLight intensity={0.4} />
        <e.pointLight
          position={[-10, -10, 5]}
          intensity={2}
          color="#ff20f0"
          theatreKey="Light 1"
        />
        <e.pointLight
          position={[0, 0.5, -1]}
          distance={1}
          // the intensity is statically set to 2, but in the state.json file we'll set it to 3,
          // and we'll use that as a test to make sure the state is being loaded correctly
          intensity={2}
          color="#e4be00"
          theatreKey="Light 2"
          ref={light2Ref}
        />

        <group position={[0, -0.9, -3]}>
          <Plane
            color="hotpink"
            rotation-x={-Math.PI / 2}
            position-z={2}
            scale={[4, 20, 0.2]}
            theatreKey="plane1"
          />
          <Plane
            color="#e4be00"
            rotation-x={-Math.PI / 2}
            position-y={1}
            scale={[4.2, 0.2, 4]}
            theatreKey="plane2"
          />
          <Plane
            color="#736fbd"
            rotation-x={-Math.PI / 2}
            position={[-1.7, 1, 3.5]}
            scale={[0.5, 4, 4]}
            theatreKey="plane3"
          />
          <Plane
            color="white"
            rotation-x={-Math.PI / 2}
            position={[0, 4.5, 3]}
            scale={[2, 0.03, 4]}
            theatreKey="plane4"
          />
        </group>
      </SheetProvider>
    </Canvas>
  )
}

import * as THREE from 'three'
import {getProject} from '@theatre/core'
import React, {useState, useEffect, useRef} from 'react'
import {useFrame, Canvas} from '@react-three/fiber'
import studio from '@theatre/studio'
import {editable as e, SheetProvider} from '@theatre/r3f'
import extension from '@theatre/r3f/dist/extension'
import {createRoot} from 'react-dom/client'

studio.extend(extension)
studio.initialize()

// credit: https://codesandbox.io/s/camera-pan-nsb7f

function Button() {
  const vec = new THREE.Vector3()
  const light = useRef<any>(undefined)
  const [active, setActive] = useState(false)
  const [zoom, set] = useState(true)
  useEffect(
    () => void (document.body.style.cursor = active ? 'pointer' : 'auto'),
    [active],
  )

  useFrame((state) => {
    const step = 0.1
    const camera = state.camera as THREE.PerspectiveCamera
    camera.fov = (THREE as any).MathUtils.lerp(camera.fov, zoom ? 10 : 42, step)
    // camera.position.lerp(
    //   vec.set(zoom ? 25 : 10, zoom ? 1 : 5, zoom ? 0 : 10),
    //   step,
    // )
    //state.camera.lookAt(0, 0, 0)
    //state.camera.updateProjectionMatrix()

    // light.current?.position.lerp(
    //   vec.set(zoom ? 4 : 0, zoom ? 3 : 8, zoom ? 3 : 5),
    //   step,
    // )
  })

  return (
    <mesh
      onClick={() => set(!zoom)}
      onPointerOver={() => setActive(true)}
      onPointerOut={() => setActive(false)}
    >
      <sphereGeometry args={[0.75, 64, 64]} />
      <meshPhysicalMaterial
        color={active ? 'purple' : '#e7b056'}
        clearcoat={1}
        clearcoatRoughness={0}
      />
      <directionalLight ref={light} intensity={1.5} />
    </mesh>
  )
}

function Plane({color, uniqueName, ...props}) {
  return (
    <mesh {...props}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function App() {
  return (
    <div>
      <Canvas
        gl={{preserveDrawingBuffer: true}}
        linear
        frameloop="demand"
        dpr={[1.5, 2]}
      >
        <SheetProvider
          sheet={getProject('Playground - R3F').sheet('R3F-Canvas')}
        >
          {/* @ts-ignore */}
          <e.perspectiveCamera makeDefault uniqueName="Camera" />
          <ambientLight intensity={0.4} />
          <pointLight position={[-10, -10, 5]} intensity={2} color="#ff20f0" />
          <pointLight
            position={[0, 0.5, -1]}
            distance={1}
            intensity={2}
            color="#e4be00"
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
          <Button />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

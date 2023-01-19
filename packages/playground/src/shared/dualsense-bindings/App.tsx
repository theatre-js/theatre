import {editable as e, SheetProvider} from '@theatre/r3f'
import {Plane} from '@react-three/drei'
import {getProject, notify} from '@theatre/core'
import React, {Suspense, useEffect} from 'react'
import {Canvas, useFrame} from '@react-three/fiber'
import {useGLTF, PerspectiveCamera} from '@react-three/drei'
import type {MovementPlane} from '@theatre/dualsense-bindings'
import DualSenseBindings, {
  createPositionBinding,
  createRotationBinding,
} from '@theatre/dualsense-bindings'
import studio from '@theatre/studio'
import type {GridHelper} from 'three'

notify.info(
  'Click anywhere to connect a controller',
  'This playground demonstrates the dualsense-bindings package. Click anywhere to connect a DualSense controller.',
)

const EditableCamera = e(PerspectiveCamera, 'perspectiveCamera')

let originalPosition: [number, number, number] | null = null
let movementPlane: MovementPlane | null = null

// All the bindings code you need (API names work in progress) ⬇️

// Mayyybe we should depend on studio in the bindings package, all the bindings will be together anyway (I think), so it's easy to exclude from the production bundle.
// This kind of injection would only make sense if we assume that bindings would be added all over the place.
const bindings = new DualSenseBindings(studio)
bindings.addBinding(
  createRotationBinding(),
  (address) => address.projectId === 'Space',
)
bindings.addBinding(
  createPositionBinding({
    // this API literally only exists so that I can do the fancy grid helper thing :D
    onStart: (plane, newOriginalPosition) => {
      movementPlane = plane
      originalPosition = newOriginalPosition
    },
    onEnd: () => {
      originalPosition = null
      movementPlane = null
    },
  }),
)

// Done

const planeSize = 20

const PositioningHelper = () => {
  const gridHelperRef = React.useRef<GridHelper>(null)

  useFrame(() => {
    if (gridHelperRef.current) {
      if (movementPlane) {
        gridHelperRef.current.visible = true
        gridHelperRef.current.position.set(...originalPosition!)
        if (movementPlane === 'xz') {
          gridHelperRef.current.rotation.x = 0
          gridHelperRef.current.rotation.y = 0
          gridHelperRef.current.rotation.z = 0
        }
        if (movementPlane === 'xy') {
          gridHelperRef.current.rotation.x = Math.PI / 2
          gridHelperRef.current.rotation.y = 0
          gridHelperRef.current.rotation.z = 0
        }
        if (movementPlane === 'yz') {
          gridHelperRef.current.rotation.x = 0
          gridHelperRef.current.rotation.y = 0
          gridHelperRef.current.rotation.z = Math.PI / 2
        }
      } else {
        gridHelperRef.current.visible = false
      }
    }
  })
  return <gridHelper ref={gridHelperRef} args={[planeSize, planeSize]} />
}

const Model = () => {
  const {scene} = useGLTF(
    'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf',
  )

  useEffect(() => {
    scene.traverse((mesh: any) => {
      mesh.castShadow = true
    })
  }, [scene])

  return (
    <e.group theatreKey="TestObject">
      <group rotation={[0, Math.PI, 0]}>
        <primitive object={scene} />
      </group>
    </e.group>
  )
}

function App() {
  return (
    <div
      onClick={() => {
        bindings.connect()
      }}
      style={{
        height: '100vh',
      }}
    >
      <Canvas
        dpr={[1.5, 2]}
        shadows
        gl={{preserveDrawingBuffer: true}}
        frameloop="demand"
      >
        <SheetProvider sheet={getProject('Space').sheet('Scene')}>
          <ambientLight intensity={0.75} />
          <Suspense fallback={null}>
            <Model />
          </Suspense>

          <EditableCamera
            theatreKey="Camera"
            makeDefault
            position={[1.3, 1, 8.1]}
            rotation={[-0.3, 0.1, 0]}
            fov={75}
          ></EditableCamera>

          <PositioningHelper />

          <spotLight
            castShadow
            intensity={1.25}
            angle={0.2}
            penumbra={1}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            position={[0, 0, 60]}
          />
          <spotLight
            castShadow
            intensity={1.25}
            angle={0.2}
            penumbra={1}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            position={[60, 0, 0]}
          />
          <spotLight
            castShadow
            intensity={1.25}
            angle={0.2}
            penumbra={1}
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            position={[0, 60, 0]}
          />
          <Plane
            args={[planeSize, planeSize]}
            position={[0, 0, -planeSize / 2]}
            receiveShadow
          >
            <meshPhysicalMaterial color="white" />
          </Plane>
          <Plane
            args={[planeSize, planeSize]}
            position={[0, -planeSize / 2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <meshPhysicalMaterial color="white" />
          </Plane>
          <Plane
            args={[planeSize, planeSize]}
            position={[-planeSize / 2, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
          >
            <meshPhysicalMaterial color="white" />
          </Plane>
          <Plane
            args={[planeSize, planeSize]}
            position={[planeSize / 2, 0, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            receiveShadow
          >
            <meshPhysicalMaterial color="white" />
          </Plane>
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

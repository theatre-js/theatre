import {
  editable as e,
  RefreshSnapshot,
  SheetProvider,
  PerspectiveCamera,
} from '@theatre/r3f'
import {Stars} from '@react-three/drei'
import {getProject} from '@theatre/core'
import React, {Suspense, useRef, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import sceneGLB from './scene.glb'
import type {Mesh} from 'three'

document.body.style.backgroundColor = '#171717'

function Model({url}: {url: string}) {
  const {nodes} = useGLTF(url) as any

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} scale={7}>
      <group rotation={[Math.PI / 13.5, -Math.PI / 5.8, Math.PI / 5.6]}>
        <e.mesh
          theatreKey="Example Namespace / Thingy"
          receiveShadow
          castShadow
          geometry={nodes.planet001.geometry}
          material={nodes.planet001.material}
        />
        <e.mesh
          theatreKey="Example Namespace / Debris 2"
          receiveShadow
          castShadow
          geometry={nodes.planet002.geometry}
          material={nodes.planet002.material}
        />
        <e.mesh
          theatreKey="Debris 1"
          geometry={nodes.planet003.geometry}
          material={nodes.planet003.material}
        />
      </group>
    </group>
  )
}

function App() {
  const bgs = ['#272730', '#b7c5d1']
  const [bgIndex, setBgIndex] = useState(0)
  const bg = bgs[bgIndex]
  const cameraTargetRef = useRef<Mesh>(null!)

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
        <SheetProvider sheet={getProject('Space').sheet('Scene')}>
          <fog attach="fog" args={[bg, 16, 30]} />
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.75} />
          <PerspectiveCamera
            theatreKey="Camera / Camera"
            makeDefault
            position={[0, 0, 16]}
            fov={75}
            lookAt={cameraTargetRef}
          >
            <e.pointLight
              theatreKey="Light 1"
              intensity={1}
              position={[-10, -25, -10]}
            />
            <e.spotLight
              theatreKey="Light 2"
              castShadow
              intensity={2.25}
              angle={0.2}
              penumbra={1}
              position={[-25, 20, -15]}
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.0001}
            />
            <e.directionalLight theatreKey="Light 3" />
          </PerspectiveCamera>
          <e.mesh
            ref={cameraTargetRef}
            theatreKey="Camera / Target"
            position={[0, 0, 0]}
            visible="editor"
          >
            <boxBufferGeometry attach="geometry" />
            <meshPhongMaterial attach="material" color="red" />
          </e.mesh>
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

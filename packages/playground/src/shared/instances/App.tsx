import {editable as e, RefreshSnapshot, SheetProvider} from '@theatre/r3f'
import {Stars} from '@react-three/drei'
import {getProject} from '@theatre/core'
import React, {Suspense, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {useGLTF, PerspectiveCamera} from '@react-three/drei'
import sceneGLB from './scene.glb'

document.body.style.backgroundColor = '#171717'

const EditableCamera = e(PerspectiveCamera, 'perspectiveCamera')

function Model({
  url,
  instance,
  ...props
}: {url: string; instance?: string} & JSX.IntrinsicElements['group']) {
  const {nodes} = useGLTF(url) as any

  return (
    <e.group
      uniqueName={`Transforms for Rocket: ${instance ?? 'default'}`}
      {...props}
    >
      <SheetProvider sheet={getProject('Space').sheet('Rocket', instance)}>
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]} scale={7}>
          <group rotation={[Math.PI / 13.5, -Math.PI / 5.8, Math.PI / 5.6]}>
            <e.mesh
              uniqueName="Thingy"
              receiveShadow
              castShadow
              geometry={nodes.planet001.geometry}
              material={nodes.planet001.material}
            />
            <e.mesh
              uniqueName="Debris 2"
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
      </SheetProvider>
    </e.group>
  )
}

function App() {
  const bgs = ['#272730', '#b7c5d1']
  const [bgIndex, setBgIndex] = useState(0)
  const bg = bgs[bgIndex]
  return (
    <div
      onClick={() => {
        // return setBgIndex((bgIndex) => (bgIndex + 1) % bgs.length)
      }}
      style={{
        height: '100vh',
      }}
    >
      <Canvas dpr={[1.5, 2]} linear shadows frameloop="demand">
        <SheetProvider sheet={getProject('Space').sheet('Scene')}>
          <fog attach="fog" args={[bg, 16, 70]} />
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.75} />
          <EditableCamera
            uniqueName="Camera"
            makeDefault
            position={[0, 0, 0]}
            fov={75}
            near={20}
            far={70}
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
            <Model url={sceneGLB} instance="Apollo" position={[18, 5, -42]} />
            <Model url={sceneGLB} instance="Sputnik" position={[-18, 5, -42]} />
          </Suspense>
          <Stars radius={500} depth={50} count={1000} factor={10} />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

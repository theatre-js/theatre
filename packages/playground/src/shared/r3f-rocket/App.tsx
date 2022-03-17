import {editable as e, RefreshSnapshot, SheetProvider} from '@theatre/r3f'
import {OrbitControls, Stars} from '@react-three/drei'
import {getProject} from '@theatre/core'
import React, {Suspense, useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import sceneGLB from './scene.glb'

document.body.style.backgroundColor = '#171717'

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: overlaps (https://sketchfab.com/overlaps)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/models/91964c1ce1a34c3985b6257441efa500
title: Space exploration [WLP series #8]
*/
function Model({url}: {url: string}) {
  const {nodes} = useGLTF(url) as any

  return (
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
    >
      <Canvas dpr={[1.5, 2]} linear shadows frameloop="demand">
        <SheetProvider getSheet={() => getProject('Space').sheet('Scene')}>
          <fog attach="fog" args={[bg, 16, 30]} />
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.75} />
          <e.perspectiveCamera
            uniqueName="Camera"
            // @ts-ignore
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
          </e.perspectiveCamera>
          <Suspense fallback={null}>
            <RefreshSnapshot />
            <Model url={sceneGLB} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Stars radius={500} depth={50} count={1000} factor={10} />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

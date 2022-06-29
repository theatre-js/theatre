import {editable as e, SheetProvider} from '@theatre/r3f'
import {getProject} from '@theatre/core'
import React from 'react'
import type {Object3DNode} from '@react-three/fiber'
import {Canvas, extend} from '@react-three/fiber'
import type {BufferGeometry, Material} from 'three'
import {Mesh} from 'three'

class MyMesh extends Mesh {
  constructor(geometry: BufferGeometry, material: Material) {
    super(geometry, material)
    this.name = 'MyMesh'
  }
}

extend({MyMesh})

interface MyElements {
  myMesh: Object3DNode<MyMesh, typeof MyMesh>
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends MyElements {}
  }
}

declare module '@theatre/r3f' {
  interface ThreeElements extends MyElements {}
}

function App() {
  return (
    <div
      style={{
        height: '100vh',
      }}
    >
      <Canvas
        dpr={[1.5, 2]}
        linear
        gl={{preserveDrawingBuffer: true}}
        frameloop="demand"
      >
        <SheetProvider sheet={getProject('Space').sheet('Scene')}>
          <e.myMesh uniqueName="myMesh" editableType="mesh">
            <torusKnotGeometry args={[1, 0.3, 128, 64]} />
            <meshNormalMaterial />
          </e.myMesh>
          <myMesh />
          <ambientLight intensity={0.75} />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

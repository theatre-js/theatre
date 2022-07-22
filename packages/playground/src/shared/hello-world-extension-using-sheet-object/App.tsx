import {editable as e, SheetProvider} from '@theatre/r3f'
import {Stars, TorusKnot} from '@react-three/drei'
import {getProject} from '@theatre/core'
import React from 'react'
import {Canvas} from '@react-three/fiber'

function App() {
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
        gl={{preserveDrawingBuffer: true}}
        frameloop="demand"
      >
        <SheetProvider sheet={getProject('Space').sheet('Scene')}>
          <ambientLight intensity={0.75} />
          <e.group uniqueName="trefoil">
            <TorusKnot scale={[1, 1, 1]} args={[1, 0.3, 128, 64]}>
              <meshNormalMaterial />
            </TorusKnot>
          </e.group>
          <Stars radius={500} depth={50} count={1000} factor={10} />
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

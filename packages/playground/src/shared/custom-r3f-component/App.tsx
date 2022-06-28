import {editable as e, SheetProvider} from '@theatre/r3f'
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
          <e.custom
            uniqueName="points"
            customComponent="points"
            editableType="mesh"
          >
            <torusKnotGeometry args={[1, 0.3, 128, 64]} />
            <meshNormalMaterial />
          </e.custom>
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

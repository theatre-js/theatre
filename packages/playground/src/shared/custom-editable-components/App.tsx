import {editable as e, SheetProvider} from '@theatre/r3f'
import {getProject} from '@theatre/core'
import React from 'react'
import {Canvas} from '@react-three/fiber'

const EditablePoints = e('points', 'mesh')

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
          <ambientLight intensity={0.75} />
          <EditablePoints theatreKey="points">
            <torusKnotGeometry args={[1, 0.3, 128, 64]} />
            <meshNormalMaterial />
          </EditablePoints>
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

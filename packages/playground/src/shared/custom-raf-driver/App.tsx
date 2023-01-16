import {editable as e, RafDriverProvider, SheetProvider} from '@theatre/r3f'
import type {IRafDriver} from '@theatre/core'
import {getProject} from '@theatre/core'
import React from 'react'
import {Canvas} from '@react-three/fiber'

const EditablePoints = e('points', 'mesh')

function App(props: {rafDriver: IRafDriver}) {
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
          <RafDriverProvider driver={props.rafDriver}>
            <ambientLight intensity={0.75} />
            <EditablePoints theatreKey="points">
              <torusKnotGeometry args={[1, 0.3, 128, 64]} />
              <meshNormalMaterial />
            </EditablePoints>
          </RafDriverProvider>
        </SheetProvider>
      </Canvas>
    </div>
  )
}

export default App

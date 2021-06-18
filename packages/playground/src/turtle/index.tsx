// sdf
import React, {useMemo, useState} from 'react'
import {render} from 'react-dom'
import {getProject} from '@theatre/core'
import type {ITurtle} from './turtle'
import TurtleRenderer from './TurtleRenderer'
import {useBoundingClientRect} from './utils'

const project = getProject('Turtle Playground')

const sheet = project.sheet('Turtle', 'The only one')

const TurtleExample: React.FC<{}> = (props) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const programFn = useMemo(() => {
    return ({forward, backward, left, right, repeat}: ITurtle) => {
      const steps = 10
      repeat(steps, () => {
        forward(steps * 2)
        right(360 / steps)
      })
    }
  }, [])

  const bounds = useBoundingClientRect(container)

  return (
    <div
      ref={setContainer}
      style={{
        position: 'fixed',
        top: '0',
        right: '20vw',
        bottom: '30vh',
        left: '20vw',
        background: 'black',
      }}
    >
      {bounds && (
        <TurtleRenderer
          sheet={sheet}
          objKey="Renderer"
          width={bounds.width}
          height={bounds.height}
          programFn={programFn}
        />
      )}
    </div>
  )
}

render(<TurtleExample />, document.getElementById('root'))

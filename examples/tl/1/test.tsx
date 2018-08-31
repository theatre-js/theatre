import React from 'react'
import {Div} from 'theatre-react-dom'

const Box = () => {
  return (
    <Timeline name="bouncingBox">
      {timeline => {
        return (
          <Div
            name="box"
            onClick={() => {
              timeline.play()
            }}
          >
            blah
          </Div>
        )
      }}
    </Timeline>
  )
}

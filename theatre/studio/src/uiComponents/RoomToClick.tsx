import React from 'react'
import styled from 'styled-components'

const Container = styled.div<{room: number}>`
  position: absolute;
  inset: ${(props) => props.room * -1}px;
`

const RoomToClick: React.FC<{room: number}> = (props) => {
  return <Container room={props.room} />
}

export default RoomToClick

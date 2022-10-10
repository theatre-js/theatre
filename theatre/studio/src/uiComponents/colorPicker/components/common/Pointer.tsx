import React from 'react'
import styled from 'styled-components'
import {Interactive} from './Interactive'

// Create an "empty" styled version, so we can reference it for contextual styling
const StyledInteractive = styled(Interactive)``

const Container = styled.div`
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border: 1px solid #ffffff00;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  ${StyledInteractive}:focus & {
    transform: translate(-50%, -50%) scale(1.1);
  }
`

const Fill = styled.div`
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: inherit;
`

interface Props {
  className?: string
  top?: number
  left: number
  color: string
}

export const Pointer = ({
  className,
  color,
  left,
  top = 0.5,
}: Props): JSX.Element => {
  const style = {
    top: `${top * 100}%`,
    left: `${left * 100}%`,
  }

  return (
    <Container style={style} className={className}>
      <Fill style={{backgroundColor: color}} />
    </Container>
  )
}

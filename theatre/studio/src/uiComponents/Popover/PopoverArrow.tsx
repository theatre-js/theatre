import React, {forwardRef, useContext} from 'react'
import {GoTriangleUp} from 'react-icons/all'
import styled, {css} from 'styled-components'
import ArrowContext from './ArrowContext'

export const popoverArrowColor = (color: string) => css`
  --popover-arrow-color: ${color};
`

const Container = styled.div`
  font-size: 18px;
  position: absolute;
  width: 0;
  height: 0;
  color: var(--popover-arrow-color);
`

const Adjust = styled.div`
  width: 20px;
  height: 18px;
  position: absolute;
  left: -10px;
  top: -11px;
  text-align: center;
`

type Props = {
  className?: string
  color?: string
}

const PopoverArrow = forwardRef<HTMLDivElement, Props>(({className}, ref) => {
  const arrowStyle = useContext(ArrowContext)
  return (
    <Container className={className} ref={ref} style={{...arrowStyle}}>
      <Adjust>
        <GoTriangleUp size={'18px'} />
      </Adjust>
    </Container>
  )
})

export default PopoverArrow

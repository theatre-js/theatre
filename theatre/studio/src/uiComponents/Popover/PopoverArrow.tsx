import React, {forwardRef} from 'react'
import {GoTriangleUp} from 'react-icons/all'
import styled from 'styled-components'
import {popoverBackgroundColor} from './Popover'

const Container = styled.div`
  font-size: 18px;
  position: absolute;
  width: 0;
  height: 0;

  color: ${() => popoverBackgroundColor};
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
}

const PopoverArrow = forwardRef<HTMLDivElement, Props>(({className}, ref) => {
  return (
    <Container className={className} ref={ref}>
      <Adjust>
        <GoTriangleUp size={'18px'} />
      </Adjust>
    </Container>
  )
})

export default PopoverArrow

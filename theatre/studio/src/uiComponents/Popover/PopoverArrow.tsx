import React, {forwardRef, useContext} from 'react'
import styled from 'styled-components'
import ArrowContext from './ArrowContext'

const Container = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  color: var(--popover-arrow-color);
  pointer-events: none;
`

const Adjust = styled.div`
  width: 12px;
  height: 8px;
  position: absolute;
  left: -7px;
  top: -8px;
  text-align: center;
  line-height: 0;
`

type Props = {
  className?: string
  color?: string
}

const InnerTriangle = styled.path`
  fill: var(--popover-bg);
`

const InnerStroke = styled.path`
  fill: var(--popover-inner-stroke);
`

const OuterStroke = styled.path`
  fill: var(--popover-outer-stroke);
`

const PopoverArrow = forwardRef<HTMLDivElement, Props>(({className}, ref) => {
  const arrowStyle = useContext(ArrowContext)
  return (
    <Container className={className} ref={ref} style={{...arrowStyle}}>
      <Adjust>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <OuterStroke d="M6 0L0 6H12L6 0Z" />
          <InnerStroke d="M6 1.5L0 7.5H12L6 1.5Z" />
          <InnerTriangle d="M6 3L0 9H12L6 3Z" />
        </svg>
      </Adjust>
    </Container>
  )
})

export default PopoverArrow

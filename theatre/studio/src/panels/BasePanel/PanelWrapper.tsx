import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React from 'react'
import styled from 'styled-components'
import {usePanel} from './BasePanel'
import PanelResizers from './PanelResizers'

const Container = styled.div`
  position: absolute;
  user-select: none;
  box-sizing: border-box;
  ${pointerEventsAutoInNormalMode};
  /* box-shadow: 1px 2px 10px -5px black; */

  z-index: 1000;
`

const PanelWrapper = React.forwardRef(
  (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    ref,
  ) => {
    const stuff = usePanel()
    const {style, children, ...otherProps} = props

    return (
      // @ts-ignore
      <Container
        // @ts-ignore
        ref={ref}
        {...otherProps}
        style={{
          width: stuff.dims.width + 'px',
          height: stuff.dims.height + 'px',
          top: stuff.dims.top + 'px',
          left: stuff.dims.left + 'px',
          ...(style ?? {}),
        }}
      >
        <PanelResizers />
        {children}
      </Container>
    )
  },
)

export default PanelWrapper

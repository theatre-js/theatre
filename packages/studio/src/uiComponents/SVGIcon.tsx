import React from 'react'
import styled, {css} from 'styled-components'

const Container = styled.div<{sizing: Sizing}>`
  width: ${(props) => (props.sizing === 'em' ? '1em' : '100%')};
  ${(props) =>
    props.sizing === 'absoluteFill' &&
    css`
      & > svg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    `}
`

type Sizing = 'em' | 'fill' | 'none' | 'absoluteFill'

const SvgIcon: React.FC<{
  src: string
  sizing?: Sizing
}> = (props) => {
  return (
    <Container
      sizing={props.sizing || 'em'}
      dangerouslySetInnerHTML={{__html: props.src}}
    />
  )
}

export default SvgIcon

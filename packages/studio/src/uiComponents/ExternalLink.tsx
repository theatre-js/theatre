import React from 'react'
import {RxExternalLink} from 'react-icons/rx'
import styled from 'styled-components'

const A = styled.a`
  text-decoration: none;
  border-bottom: 1px solid #888;
  position: relative;
  display: inline-block;
  margin-left: 0.4em;

  &:hover,
  &:active {
    border-color: #ccc;
  }
`

const IconContainer = styled.span`
  padding-right: 0.2em;
  fotn-size: 0.8em;
  position: relative;
  top: 2px;
`

const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof A>
>(({children, ...props}, ref) => {
  return (
    <A {...props} ref={ref}>
      {/* <FaExternalLinkAlt /> */}
      <IconContainer>
        <RxExternalLink />
      </IconContainer>
      {children}
    </A>
  )
})

export default ExternalLink

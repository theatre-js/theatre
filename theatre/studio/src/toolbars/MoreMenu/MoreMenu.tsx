import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 148px;
  border-radius: 2px;
  background-color: rgba(42, 45, 50, 0.9);
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25), 0px 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(14px);
  pointer-events: auto;
  // makes the edges of the item highlights match the rounded corners
  overflow: hidden;
`

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 12px;
  font-weight: 400;
  font-size: 11px;
  height: 32px;
  text-decoration: none;
  user-select: none;
  cursor: default;

  &.secondary {
    color: rgba(255, 255, 255, 0.5);
  }

  &:hover {
    background-color: #398995;
    color: white !important;
  }
`

const Divider = styled.div`
  height: 1px;
  margin: 0 2px;
  background: rgba(255, 255, 255, 0.02);
`

const untaggedVersion = `0.5.0`
const version = `0.5.0-rc.1`

const MoreMenu = React.forwardRef((props: {}, ref) => {
  return (
    <Container ref={ref as $IntentionalAny}>
      <Item
        as="a"
        href="https://docs.theatrejs.com"
        className=""
        target="_blank"
      >
        Docs
      </Item>
      <Item
        as="a"
        href={`https://docs.theatrejs.com/changelog#${encodeURIComponent(
          untaggedVersion,
        )}`}
        className=""
        target="_blank"
      >
        What's new?
      </Item>

      <Divider />
      <Item
        as="a"
        href="https://github.com/theatre-js/theatre"
        className="secondary"
        target="_blank"
      >
        Github
      </Item>
      <Item
        as="a"
        href="https://twitter.com/theatre_js"
        className="secondary"
        target="_blank"
      >
        Twitter
      </Item>
      <Item
        className="secondary"
        as="a"
        href="https://discord.gg/bm9f8F9Y9N"
        target="_blank"
      >
        Discord
      </Item>
      <Divider />
      <Item className="secondary">Theatre.js {version}</Item>
    </Container>
  )
})

export default MoreMenu

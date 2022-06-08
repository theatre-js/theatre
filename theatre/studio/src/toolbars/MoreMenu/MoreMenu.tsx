import {useVal} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 138px;
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

  @supports not (backdrop-filter: blur()) {
    background-color: rgba(42, 45, 50, 0.98);
  }
`

const Item = styled.div`
  position: relative;
  padding: 0px 12px;
  font-weight: 400;
  font-size: 11px;
  height: 32px;
  text-decoration: none;
  user-select: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: default;
`

const Link = styled(Item)`
  &:before {
    position: absolute;
    display: block;
    content: ' ';
    inset: 3px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
  }

  &.secondary {
    color: rgba(255, 255, 255, 0.5);
  }

  &:hover {
    /* background-color: #398995; */
    color: white !important;
    &:before {
      opacity: 1;
    }
  }
`

const VersionContainer = styled(Item)`
  height: auto;
  min-height: 32px;
  padding-top: 12px;
  padding-bottom: 10px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
`

const VersionLabel = styled.div`
  font-weight: 600;
`

const VersionValueRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const VersionValue = styled.div`
  margin-left: 2px;
`

const Divider = styled.div`
  height: 1px;
  margin: 0 2px;
  background: rgba(255, 255, 255, 0.02);
`

const UpdateDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #40aaa4;
  right: 14px;
  top: 12px;
  border-radius: 50%;
`

const version: string = process.env.version ?? '0.4.0'

const untaggedVersion: string = version.match(/^[^\-]+/)![0]

const MoreMenu = React.forwardRef((props: {}, ref) => {
  const hasUpdates = useVal(
    getStudio().atomP.ahistoric.updateChecker.result.hasUpdates,
  )

  return (
    <Container ref={ref as $IntentionalAny}>
      <Link
        as="a"
        href="https://docs.theatrejs.com"
        className=""
        target="_blank"
      >
        Docs
      </Link>

      <Link
        as="a"
        href={`https://docs.theatrejs.com/changelog`}
        className=""
        target="_blank"
      >
        Changelog
      </Link>

      <Divider />
      <Link
        as="a"
        href="https://github.com/theatre-js/theatre"
        className=""
        target="_blank"
      >
        Github
      </Link>
      <Link
        as="a"
        href="https://twitter.com/theatre_js"
        className=""
        target="_blank"
      >
        Twitter
      </Link>
      <Link
        className=""
        as="a"
        href="https://discord.gg/bm9f8F9Y9N"
        target="_blank"
      >
        Discord
      </Link>
      <Divider />
      <VersionContainer>
        <VersionLabel>Version</VersionLabel>
        <VersionValueRow>
          <VersionValue>
            {version}{' '}
            {hasUpdates === true
              ? '(outdated)'
              : hasUpdates === false
              ? '(latest)'
              : ''}
          </VersionValue>
        </VersionValueRow>
      </VersionContainer>
      {hasUpdates === true && (
        <>
          <Divider />
          <Link
            as="a"
            href={`https://docs.theatrejs.com/update#${encodeURIComponent(
              untaggedVersion,
            )}`}
            className=""
            target="_blank"
          >
            Update
            <UpdateDot />
          </Link>
          <Link
            as="a"
            href={`https://docs.theatrejs.com/changelog#${encodeURIComponent(
              untaggedVersion,
            )}`}
            className=""
            target="_blank"
          >
            What's new?
          </Link>
        </>
      )}
    </Container>
  )
})

export default MoreMenu

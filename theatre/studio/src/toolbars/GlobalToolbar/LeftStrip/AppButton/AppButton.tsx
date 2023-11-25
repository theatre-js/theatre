import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'
import React from 'react'
import styled from 'styled-components'
import logo from '@theatre/studio/assets/logo.png'
import DropdownChevron from '@theatre/studio/uiComponents/icons/DropdownChevron'
import BaseMenu from '@theatre/studio/uiComponents/simpleContextMenu/ContextMenu/BaseMenu'

const Container = styled.div`
  height: 100%;
  width: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  ${pointerEventsAutoInNormalMode};
  &:hover {
    --chevron-down: 1;
    background: rgba(255, 255, 255, 0.08);
  }
`

const Logo = styled.img`
  width: 16px;
  height: 15px;
`

const appButtonTitle = 'Theatre.js 0.8'
const AppButton: React.FC<{}> = (props) => {
  const s = useChordial(() => {
    return {
      items: [],
      title: appButtonTitle,
      invoke: {
        type: 'popover',
        render: ({close}) => {
          return (
            <BaseMenu
              onRequestClose={close}
              items={[
                {label: "What's new?", callback: () => {}},
                {type: 'separator'},
                {label: 'Chat with us', callback: () => {}},
                {label: 'Help', callback: () => {}},
                {label: 'Changelog', callback: () => {}},
                {type: 'separator'},
                {label: 'Github', callback: () => {}},
                {label: 'Discord', callback: () => {}},
                {label: 'Twitter', callback: () => {}},
                {type: 'separator'},
                {label: 'Settings', callback: () => {}},
              ]}
              displayName={appButtonTitle}
            />
          )
        },
      },
    }
  })
  return (
    <>
      <Container ref={s.targetRef}>
        <Logo src={logo} />
        <DropdownChevron />
      </Container>
    </>
  )
}

export default AppButton

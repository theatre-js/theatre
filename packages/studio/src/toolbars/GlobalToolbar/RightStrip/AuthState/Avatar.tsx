import type {AuthDerivedState} from '@theatre/studio/Auth'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import getStudio from '@theatre/studio/getStudio'
import type {ContextMenuItem} from '@theatre/studio/uiComponents/chordial/chordialInternals'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'
import BaseMenu from '@theatre/studio/uiComponents/simpleContextMenu/ContextMenu/BaseMenu'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 28px;
  height: 28px;
  position: relative;
  ${pointerEventsAutoInNormalMode};

  &:active {
    transform: translateY(1px);
  }
`

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  border-radius: 50px;
  --box-shadow-color: rgba(0, 0, 0, 0.7);
  box-shadow: 0px 4px 4px -1px var(--box-shadow-color);

  ${Container}:hover & {
    --box-shadow-color: rgba(0, 0, 0, 1);
  }
`

const auth = getStudio().auth

const Stroke = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 50px;
  background: rgba(151, 208, 249, 0.6);

  ${Container}:hover & {
    background: rgba(151, 208, 249, 0.9);
    transform: scale(1.05);
  }

  ${Container}:active & {
    background: rgba(151, 208, 249, 0.9);
    transform: scale(1.05);
  }

  backdrop-filter: blur(2px);

  --gradient-cutoff: 62%;

  // add a mask, so that a circle is cut out of the stroke
  mask-image: radial-gradient(
    circle at center,
    transparent 0%,
    transparent var(--gradient-cutoff),
    black var(--gradient-cutoff)
  );
`

type Props = {authState: Extract<AuthDerivedState, {loggedIn: true}>}

const Avatar: React.FC<Props> = (props) => {
  // const p = usePopover(
  //   () => {
  //     return {debugName: 'Avatar popover'}
  //   },
  //   ,
  // )
  const c = useChordial(() => {
    const userFullName = 'Aria Minaei'
    return {
      title: `User: ${userFullName}`,
      menuTitle: 'User',
      items: [],
      invoke: {
        type: 'popover',
        render: ({close}) => {
          const items: ContextMenuItem[] = [
            {label: 'My account', type: 'normal', callback: () => {}},
            {type: 'separator'},
            {label: 'Help', type: 'normal', callback: () => {}},
            {label: 'Keyboard shortcuts', type: 'normal', callback: () => {}},
            {type: 'separator'},
            {
              label: 'Log out',
              type: 'normal',
              callback: () => auth.deauthorize(),
            },
          ]

          return <BaseMenu items={items} onRequestClose={close} />
        },
      },
    }
  })

  const url = `https://pbs.twimg.com/profile_images/1367137683/aria_400x400.jpg`

  return (
    <>
      <Container ref={c.targetRef}>
        <AvatarImage src={url} />
        <Stroke />
      </Container>
    </>
  )
}

export default Avatar

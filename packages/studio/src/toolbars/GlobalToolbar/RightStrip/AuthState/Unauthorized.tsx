import type {AuthDerivedState} from '@theatre/studio/Auth'
import getStudio from '@theatre/studio/getStudio'
import ToolbarButton from '@theatre/studio/uiComponents/toolbar/ToolbarButton'
import React from 'react'
import SimplePopover from '@theatre/studio/uiComponents/Popover/SimplePopover'
import styled from 'styled-components'

const ThePopover = styled(SimplePopover)`
  width: 380px;
  padding: 24px 14px;
  font-weight: 500;
  backdrop-filter: blur(8px) contrast(65%) brightness(59%);
  --popover-bg: rgb(58 59 67);
  --popover-outer-stroke: rgb(99 100 112);
  box-shadow: rgb(0 0 0 / 55%) 1px 8px 13px 6px;
`

const P1 = styled.p`
  margin-bottom: 1em;
`

const auth = getStudio().auth

const Unauthorized: React.FC<{
  authState: Extract<AuthDerivedState, {loggedIn: false}>
}> = ({authState}) => {
  // const authState: Extract<AuthDerivedState, {loggedIn: false}> = {
  //   loggedIn: false,
  //   procedureState: {
  //     type: 'authorize',
  //     deviceTokenFlowState: {
  //       type: 'waitingForDeviceCode',
  //       // verificationUriComplete: 'https://google.com',
  //     },
  //   },
  // }

  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const {procedureState} = authState
  if (!procedureState)
    return (
      <ToolbarButton primary={true} onClick={() => auth.authorize()}>
        Log in
      </ToolbarButton>
    )

  let popoverBody = null
  if (procedureState.type === 'authorize') {
    const {deviceTokenFlowState} = procedureState
    if (deviceTokenFlowState?.type === 'waitingForDeviceCode') {
      popoverBody = (
        <>
          <P1 className="text-lg font-mdium text-center">Logging you in...</P1>
          <p className="font-medium text-center">
            <span className="text-color-pale">Waiting for OAuth token.</span>
          </p>
        </>
      )
    } else if (deviceTokenFlowState?.type === 'codeReady') {
      popoverBody = (
        <>
          <P1 className="text-lg font-mdium text-center">
            Complete log in in the popup.
          </P1>
          <p className="font-medium text-center">
            <span className="text-color-pale">Popup didn't show up?</span>{' '}
            <a
              href={deviceTokenFlowState.verificationUriComplete}
              target="_blank"
            >
              Try this link.
            </a>
          </p>
        </>
      )
    } else {
      popoverBody = `Logging in...`
    }
  }

  return (
    <>
      <ToolbarButton disabled={true} ref={buttonRef}>
        {procedureState.type === 'authorize' ? 'Logging in' : 'Log in'}
      </ToolbarButton>
      {popoverBody && (
        <ThePopover verticalGap={4} target={buttonRef}>
          {popoverBody}
        </ThePopover>
      )}
    </>
  )
  return <></>
}

export default Unauthorized

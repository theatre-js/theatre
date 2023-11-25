import {useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import ToolbarButton from '@theatre/studio/uiComponents/toolbar/ToolbarButton'
import React from 'react'
import Unauthorized from './Unauthorized'
import Avatar from './Avatar'

const auth = getStudio().auth

const AuthState: React.FC<{}> = (props) => {
  const authState = useVal(auth.derivedState)

  if (authState === 'loading') {
    return <></>
  }

  if (!authState.loggedIn) {
    return <Unauthorized authState={authState} />
  } else {
    return (
      <>
        <ToolbarButton primary={true} onClick={() => {}}>
          Share
        </ToolbarButton>
        <Avatar authState={authState} />
      </>
    )
  }
}

export default AuthState

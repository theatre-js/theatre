import type {Prism} from '@theatre/dataverse'
import {Atom, prism, val} from '@theatre/dataverse'
import type {$FixMe} from '@theatre/core/types/public'

type State = {
  loginState:
    | {loggedIn: false}
    | {loggedIn: true; accessToken: string; refreshToken: string}

  authenticateProcessState:
    | {
        // the authentication flow is not started, becuase either the user is already logged in, or the user hasn't tried to log in yet
        type: 'idle'
      }
    | {
        // the user tried to log in, and we're waiting for the server to generate a checkToken, after which we'll redirect the user to the authentication page of the server
        type: 'autnenticating/waiting-for-checkToken'
        // the time at which the user tried to log in
        time: number
        // a random string generated on the client, which will be used to identify the authentication flow
        clientFlowToken: string
        // the time at which waiting for checkToken will expire
        expiresAt: number
      }
    | {
        // the user tried to log in, but the server failed to generate a checkToken. We should display an error message to the user
        type: 'authenticating/waiting-for-checkToken/error'
        error: {code: string; message: string}
        // the time at which the error was received
        time: number
      }
    | {
        // we've received a checkToken
        type: 'autnenticating/waiting-for-accessToken'
        checkToken: string
        // the url to which we should redirect the user
        userAuthUrl: string
        // the interval at which we should poll the server for the access token
        interval: number
        // the clientFlowToken that we sent to the server
        clientFlowToken: string
        // the time at which waiting for accessToken will expire
        expiresAt: number
      }
    | {
        // for some reason, the server did not send us an access token. We should display an error message to the user
        type: 'autnenticating/waiting-for-accessToken/error'
        error:
          | {
              // user denied this session access
              code: 0
              message: string
            }
          | {
              // other error
              code: 1
              message: string
            }
      }
    | {
        // we've received an access/refreshtoken (saved to loginState). This state is used to display a success message to the user, after which we'll switch to idle
        type: 'success'
        time: number
      }
}

type UserInfo = {
  email: string
  displayName: string
  avatarUrl: string
  id: string
}

export default class Storno {
  protected _atom: Atom<State>

  protected _userInfo: Prism<null | UserInfo>

  constructor() {
    this._atom = new Atom<State>({
      loginState: {loggedIn: false},
      authenticateProcessState: {type: 'idle'},
    })

    this._userInfo = prism(() => {
      const loginState = val(this._atom.pointer.loginState)
      if (!loginState.loggedIn) {
        return null
      }

      const {accessToken} = loginState
      const payload = accessToken as $FixMe // TODO: decode payload
      // let's trust that the payload is correct

      return payload.userInfo
    })
  }

  get userInfoPr(): Prism<null | UserInfo> {
    return null as $FixMe
  }
}

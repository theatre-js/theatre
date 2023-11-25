import type { Prism} from '@theatre/dataverse';
import {Atom, prism, val} from '@theatre/dataverse'
import {TRPCClientError} from '@trpc/client'
import delay from '@theatre/utils/delay'
import type {$FixMe, $IntentionalAny} from '@theatre/utils/types'
import {defer} from '@theatre/utils/defer'
import {
  generateRandomCodeVerifier,
  calculatePKCECodeChallenge,
} from 'oauth4webapi'
import type {Studio} from './Studio'
import getStudio from './getStudio'
import {decodeJwt} from 'jose'
import type {studioAccessScopes, studioAuthTokens} from '@theatre/app/types'
import type {AtomPersistor} from '@theatre/utils/persistAtom'
import {persistAtom} from '@theatre/utils/persistAtom'

type PersistentState =
  | {loggedIn: false}
  | {loggedIn: true; idToken: string; accessToken: string}

type ProcedureState =
  | {
      type: 'authorize'
      deviceTokenFlowState: DeviceTokenFlowState | undefined
    }
  | {
      type: 'expandScope'
      additionalScope: studioAccessScopes.Scopes
      deviceTokenFlowState: DeviceTokenFlowState | undefined
    }
  | {
      type: 'refreshTokens'
    }
  | {
      type: 'destroyIdToken'
    }

type CurrentProcedure = {
  abortController: AbortController
  promise: Promise<void>
  procedureState: ProcedureState
}

type EphemeralState = {
  loaded: boolean
  currentProcedure: undefined | CurrentProcedure
}

type DeviceTokenFlowState =
  | {
      type: 'waitingForDeviceCode'
      // codeChallenge: string
      // codeVerifier: string
    }
  | {
      type: 'codeReady'
      verificationUriComplete: string
      // codeChallenge: string
      // codeVerifier: string
      // userCode: string
      // deviceCode: string
      // lastTokenRequestTime: number | undefined
      // interval: number
    }

const bcId = Math.random().toString(36).slice(2)

export type AuthDerivedState =
  | 'loading'
  | {
      loggedIn: false
      procedureState: undefined | ProcedureState
    }
  | {
      loggedIn: true
      user: {email: string}
      procedureState: undefined | ProcedureState
    }

export default class Auth {
  private _persistentState = new Atom<PersistentState>({loggedIn: false})
  private _atomPersistor: AtomPersistor | undefined
  private _broadcastChannel: BroadcastChannel | undefined

  private _ephemeralState = new Atom<EphemeralState>({
    currentProcedure: undefined,
    loaded: false,
  })

  private _readyDeferred = defer<void>()
  readonly derivedState: Prism<AuthDerivedState>

  constructor(readonly studio: Studio) {
    const persistAtomDeferred = defer<void>()

    void this.studio._optsPromise.then((o) => {
      if (o.usePersistentStorage === true) {
        this._atomPersistor = persistAtom(
          this._persistentState as $IntentionalAny as Atom<{}>,
          this._persistentState.pointer as $IntentionalAny,
          () => persistAtomDeferred.resolve(),
          o.persistenceKey + 'auth',
        )

        const bc = new BroadcastChannel(`theatrejs-auth-${o.persistenceKey}`)
        this._broadcastChannel = bc
        // listen to changes from other tabs
        bc.addEventListener('message', (e) => {
          if (e.data !== bcId) {
            this._atomPersistor?.refresh()
          }
        })
      } else {
        persistAtomDeferred.resolve()
      }
    })

    void persistAtomDeferred.promise.then(() => {
      this._readyDeferred.resolve()
    })

    void this._readyDeferred.promise.then(() => {
      this._ephemeralState.setByPointer((p) => p.loaded, true)
    })

    this.derivedState = prism((): AuthDerivedState => {
      const ephemeralState = val(this._ephemeralState.pointer)
      if (!ephemeralState.loaded) {
        return 'loading'
      }
      const persistentState = val(this._persistentState.pointer)
      if (persistentState.loggedIn) {
        return {
          loggedIn: true,
          user: getIdTokenClaimsWithoutVerifying(persistentState.idToken) ?? {
            email: 'unknown',
          },
          procedureState: ephemeralState.currentProcedure?.procedureState,
        }
      } else {
        return {
          loggedIn: false,
          procedureState: ephemeralState.currentProcedure?.procedureState,
        }
      }
    })
  }

  get ready() {
    return this._readyDeferred.promise
  }

  private async _acquireLock<T>(
    abortController: AbortController,
    initialState: ProcedureState,
    cb: (
      abortSignal: AbortSignal,
      setState: (procedureState: ProcedureState) => void,
    ) => Promise<T>,
  ): Promise<T> {
    if (this._readyDeferred.status !== 'resolved') {
      throw new Error('Not ready')
    }
    if (this._ephemeralState.get().currentProcedure) {
      throw new Error('Already running a procedure')
    }

    const d = defer<T>()

    try {
      await navigator.locks.request(
        'theatrejs-auth',
        {mode: 'exclusive', ifAvailable: true},
        async (possibleLock) => {
          if (!possibleLock) {
            d.reject(new Error('Failed to acquire lock'))
            return
          }

          if (abortController.signal.aborted) {
            d.reject(new Error('Aborted'))
            return
          }

          const currentProcedure: CurrentProcedure = {
            abortController,
            promise: d.promise.then(() => {}),
            procedureState: initialState,
          }
          this._ephemeralState.setByPointer(
            (p) => p.currentProcedure,
            currentProcedure,
          )
          this._atomPersistor?.refresh()
          const setProcedureState = (procedureState: ProcedureState) => {
            this._ephemeralState.setByPointer((p) => p.currentProcedure, {
              ...currentProcedure,
              procedureState,
            })
          }

          try {
            const ret = await cb(abortController.signal, setProcedureState)
            this._atomPersistor?.flush()
            this._broadcastChannel?.postMessage(bcId)
            d.resolve(ret)
          } catch (err) {
            d.reject(err)
          }
        },
      )
    } finally {
      this._ephemeralState.setByPointer((p) => p.currentProcedure, undefined)
    }

    return d.promise
  }

  /**
   * Runs the authorization procedure. Will error if already authorized, or if another procedure is already running.
   */
  async authorize() {
    const abortController = new AbortController()
    const initialState: ProcedureState = {
      type: 'authorize',
      deviceTokenFlowState: undefined,
    }
    await this._acquireLock(
      abortController,
      initialState,
      async (abortSignal, setState) => {
        const persistentState = this._persistentState.get()

        if (persistentState.loggedIn) {
          throw new Error('Already authorized')
        }

        const result = await tokenProcedures.deviceAuthorizationFlow(
          ['workspaces-list'],
          undefined,
          (state) => {
            setState({...initialState, deviceTokenFlowState: state})
          },
          abortSignal,
        )

        if (!result.success) {
          throw new Error(`Failed to authorize: ${result.error}: ${result.msg}`)
        }

        const {accessToken, idToken} = result
        this._persistentState.set({loggedIn: true, accessToken, idToken})
      },
    )
  }

  /**
   * Runs the authorization procedure. Will if another procedure is already running.
   */
  async deauthorize() {
    const abortController = new AbortController()
    const initialState: ProcedureState = {
      type: 'destroyIdToken',
    }
    await this._acquireLock(
      abortController,
      initialState,
      async (abortSignal) => {
        const persistentState = this._persistentState.get()

        if (!persistentState.loggedIn) {
          return
        }

        const result = await tokenProcedures.destroyIdToken(
          persistentState.idToken,
          abortSignal,
        )

        if (!result.success) {
          throw new Error(
            `Failed to deauthorize: ${result.error}: ${result.msg}`,
          )
        }

        this._persistentState.set({loggedIn: false})
      },
    )
  }

  // /**
  //  * Resolves with the access token. If no token is set, it'll wait until one is. Note that this will _NOT_ trigger authentication,
  //  * so if this function is called and the user is not authenticated, it'll wait forever.
  //  */
  // private async _getValidAccessToken(): Promise<string> {
  //   // no ongoing authentication atm
  //   if (!this._ephemeralState.get().authFlowState) {
  //     const authState = this._persistentState.get()
  //     // and the access token is available
  //     if (authState) {
  //       return authState.accessToken
  //     } else {
  //       throw new Error('Not authenticated')
  //     }
  //   } else {
  //     const accessToken = await this._waitForAccessToken()
  //     return accessToken
  //   }
  // }

  /**
   * If logged in, returns the access token. If not, it'll wait until the user
   * initiaites a login flow, and then return the access token.
   */
  // private async _waitForAccessToken(): Promise<string> {
  //   await this._readyDeferred.promise
  //   const notReady = {}
  //   const accessToken = await waitForPrism(
  //     prism<typeof notReady | string>(() => {
  //       const s = val(this._mishmashState.pointer)

  //       if (s.type === 'loggedIn') {
  //         return s.accessToken
  //       }
  //       return notReady
  //     }),
  //     (v): v is string => v !== notReady,
  //   )
  //   return accessToken as $IntentionalAny
  // }

  private _getAccessToken(): string | undefined {
    const s = val(this._persistentState.pointer)
    if (s.loggedIn) {
      return s.accessToken
    }
    return undefined
  }

  async _refreshTokens() {
    // TODO
  }

  async wrapTrpcProcedureWithAuth<
    Input,
    Ret,
    Fn extends (
      input: Input & {studioAuth: {accessToken: string}},
      opts: $IntentionalAny,
    ) => Promise<Ret>,
  >(
    fn: Fn,
    args: [Input, $IntentionalAny],
    path: string[],
    retriesLeft: number = 3,
  ): Promise<Ret> {
    await this.ready
    const accessToken = this._getAccessToken()
    if (!accessToken) {
      throw new Error('Not authenticated')
    }
    const [input, opts] = args
    try {
      const isSubscribe = path[path.length - 1] === 'subscribe'
      if (isSubscribe) {
        const response = fn({...input, studioAuth: {accessToken}}, opts)
        return response
      } else {
        const response = await fn({...input, studioAuth: {accessToken}}, opts)
        return response
      }
    } catch (err) {
      console.log('err', err)
      if (err instanceof TRPCClientError && err.data.code === 'UNAUTHORIZED') {
        console.log('is unaothorized error')
        if (retriesLeft <= 0) {
          return Promise.reject(err)
        }
        // this is a 401, which means as long as we have a valid accessToken, we should be able to retry the request
        await this._refreshTokens()
        return this.wrapTrpcProcedureWithAuth(fn, args, path, retriesLeft - 1)
      } else {
        return Promise.reject(err)
      }
    }
  }
}

namespace tokenProcedures {
  /**
   * Runs a device authorization flow, and returns the access token and id token if successful.
   *
   * @param scope - The scopes to request. If originalIdToken is provided, the scopes will be expanded to include the scopes of the original token.
   * @param originalIdToken - The original id token, if any. If provided, the scopes will be expanded to include the scopes of the original token.
   * @param stateChange - A callback that will be called whenever the state of the flow changes.
   * @param abortSignal - The abort signal to use for the flow.
   * @returns
   */
  export async function deviceAuthorizationFlow(
    scope: studioAccessScopes.Scopes,
    originalIdToken: string | undefined,
    stateChange: (s: DeviceTokenFlowState) => void,
    abortSignal?: AbortSignal,
  ): Promise<
    | {success: true; accessToken: string; idToken: string}
    | {success: false; error: 'userDenied' | 'unknown'; msg?: string}
  > {
    const appLink = await getStudio()._rawLinks.app

    let outerTries = 0
    outer: while (outerTries < 2) {
      outerTries++

      if (abortSignal?.aborted) {
        return {success: false, error: 'unknown', msg: 'Aborted'}
      }

      const nounce = generateRandomCodeVerifier()
      const codeVerifier = generateRandomCodeVerifier()
      const codeChallenge = await calculatePKCECodeChallenge(codeVerifier)

      stateChange({
        type: 'waitingForDeviceCode',
        // codeChallenge,
        // codeVerifier,
      })

      const flowInitResult = await appLink.api.studioAuth.deviceCode.mutate(
        {
          nounce,
          codeChallenge,
          codeChallengeMethod: 'S256',
          scopes: scope,
          originalIdToken,
        },
        {signal: abortSignal},
      )

      stateChange({
        type: 'codeReady',
        // codeChallenge,
        // codeVerifier,
        // deviceCode: flowInitResult.deviceCode,
        verificationUriComplete: flowInitResult.verificationUriComplete,
        // userCode: '',
        // interval: flowInitResult.interval,
        // lastTokenRequestTime: undefined,
      })

      // window.open(flowInitResult.verificationUriComplete, '_blank')

      inner: while (true) {
        if (abortSignal?.aborted) {
          return {success: false, error: 'unknown', msg: 'Aborted'}
        }
        await delay(flowInitResult.interval + 1000, abortSignal)
        try {
          const result = await appLink.api.studioAuth.tokens.mutate(
            {
              deviceCode: flowInitResult.deviceCode,
              codeVerifier,
            },
            {signal: abortSignal},
          )
          if (result.isError) {
            if (result.error === 'invalidDeviceCode') {
              console.error(result)
              continue outer
            } else if (result.error === 'userDeniedAuth') {
              return {success: false, error: 'userDenied'}
            } else if (result.error === 'notYetReady') {
              continue inner
            } else {
              const msg = `Unknown error returned from app-studio-trpc: ${result.error} - ${result.errorMessage}`
              console.error(msg)
              return {success: false, error: 'unknown', msg}
            }
          } else {
            const {idToken, accessToken} = result

            // TODO verify that the refresh token has the correct nounce
            if (false) {
              console.warn('The request returned an invalid nounce')
              continue outer
            }

            return {success: true, accessToken, idToken}
          }
        } catch (err) {
          console.error(err)
          return {
            success: false,
            error: 'unknown',
            msg: (err as $IntentionalAny).message,
          }
        }
      }
    }
    return {success: false, error: 'unknown'}
  }

  export async function refreshTokens(
    originalIdToken: string,
    abortSignal?: AbortSignal,
  ): Promise<
    | {success: true; accessToken: string; idToken: string}
    | {success: false; error: 'invalidIdToken' | 'unknown'; msg: string}
  > {
    const appLink = await getStudio()._rawLinks.app
    let tries = 0
    const MAX_TRIES = 8
    while (true) {
      if (abortSignal?.aborted) {
        return {success: false, error: 'unknown', msg: 'Aborted'}
      }
      tries++
      if (tries > MAX_TRIES) {
        return {success: false, error: 'unknown', msg: 'Too many tries'}
      }
      const result = await appLink.api.studioAuth.refreshAccessToken.mutate(
        {refreshToken: originalIdToken},
        {signal: abortSignal},
      )
      if (result.isError) {
        if (result.error === 'invalidRefreshToken') {
          throw new Error('Invalid refresh token')
        } else {
          if (tries > MAX_TRIES) {
            return {success: false, error: 'unknown', msg: result.errorMessage}
          }
          continue
        }
      } else {
        return {
          accessToken: result.accessToken,
          idToken: result.refreshToken,
          success: true,
        }
      }
    }
  }

  export async function destroyIdToken(
    idToken: string,
    abortSignal?: AbortSignal,
  ): Promise<
    | {success: true}
    | {success: false; error: 'invalidIdToken' | 'unknown'; msg: string}
  > {
    const appLink = await getStudio()._rawLinks.app
    const result = await appLink.api.studioAuth.destroyIdToken.mutate(
      {idToken: idToken},
      {signal: abortSignal},
    )
    if (result.isError) {
      return {success: false, error: 'unknown', msg: result.errorMessage}
    } else {
      return {success: true}
    }
  }
}

function getIdTokenClaimsWithoutVerifying(
  idToken: string,
): undefined | studioAuthTokens.IdTokenPayload {
  try {
    const s = decodeJwt(idToken)
    return s as $FixMe
  } catch (err) {
    console.log(`getIdTokenClaimsWithoutVerifying failed:`, err)
    return undefined
  }
}

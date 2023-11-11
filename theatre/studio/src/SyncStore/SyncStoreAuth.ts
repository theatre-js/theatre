import {Atom, prism, val} from '@theatre/dataverse'
import {TRPCClientError} from '@trpc/client'
import {v4} from 'uuid'
import delay from '@theatre/utils/delay'
import type {$IntentionalAny} from '@theatre/utils/types'
import waitForPrism from '@theatre/utils/waitForPrism'
import {defer} from '@theatre/utils/defer'
import {persistAtom} from '@theatre/utils/persistAtom'
import type SyncServerLink from './SyncServerLink'
import type AppLink from './AppLink'
import {get} from 'lodash-es'
import type {StudioStoreOptions} from '@theatre/studio/StudioStore/StudioStore'

export default class SyncStoreAuth {
  private _persistentState = new Atom<
    | undefined
    | {
        accessToken: string
        refreshToken: string
      }
  >(undefined)

  private _ephemeralState = new Atom<{
    authFlowState:
      | 'autnenticating/waiting-for-checkToken'
      | 'autnenticating/waiting-for-accessToken'
      | undefined
    ready: boolean
  }>({authFlowState: undefined, ready: false})

  public readonly ready: Promise<void>

  public readonly syncServerApi: TrpcClientWrapped<SyncServerLink['api']>

  public readonly appApi: TrpcClientWrapped<AppLink['api']>

  constructor(
    protected readonly _options: Promise<StudioStoreOptions>,
    protected readonly _appLink: Promise<AppLink>,
    protected readonly _syncServerLink: Promise<SyncServerLink>,
  ) {
    const persistAtomDeferred = defer<void>()
    this.ready = persistAtomDeferred.promise
    void this.ready.then(() =>
      this._ephemeralState.setByPointer((p) => p.ready, true),
    )
    void _options.then((o) => {
      if (o.usePersistentStorage === true) {
        persistAtom(
          this._persistentState as $IntentionalAny as Atom<{}>,
          this._persistentState.pointer as $IntentionalAny,
          () => persistAtomDeferred.resolve(),
          o.persistenceKey + 'auth',
        )
      } else {
        persistAtomDeferred.resolve()
      }
    })

    this.syncServerApi = wrapTrpcClientWithAuth(
      this._syncServerLink.then((s) => s.api),
      (fn: any, args: any[], path): any => {
        return this._wrapTrpcProcedureWithAuth(
          fn,
          args as $IntentionalAny,
          path,
        )
      },
    )

    this.appApi = wrapTrpcClientWithAuth(
      this._appLink.then((s) => s.api),
      (fn: any, args: any[], path): any =>
        this._wrapTrpcProcedureWithAuth(fn, args as $IntentionalAny, path),
    )
  }

  async authenticate(
    opts: {skipIfAlreadyAuthenticated?: boolean} = {},
  ): Promise<
    | {
        success: false
        error:
          | 'alreadyAuthenticated'
          | 'alreadyAuthenticating'
          | 'userDeniedLogin'
          | 'unknown'
        msg?: string
      }
    | {success: true}
  > {
    {
      if (this._persistentState.get()) {
        if (opts.skipIfAlreadyAuthenticated) {
          return {success: true}
        } else {
          return {success: false, error: 'alreadyAuthenticated'}
        }
      }

      if (this._ephemeralState.get().authFlowState) {
        return {success: false, error: 'alreadyAuthenticating'}
      }
    }

    const appLink = await this._appLink

    let outerTries = 0
    outer: while (outerTries < 2) {
      outerTries++
      this._ephemeralState.setByPointer(
        (p) => p.authFlowState,
        'autnenticating/waiting-for-checkToken',
      )
      try {
        const clientFlowToken = v4()
        const flowInitResult =
          await appLink.api.studioAuth.getPreAuthenticationToken.mutate({
            clientFlowToken,
          })

        window.open(flowInitResult.userAuthUrl, '_blank')

        inner: while (true) {
          await delay(flowInitResult.interval + 1000)
          try {
            const result =
              await appLink.api.studioAuth.getTokensFromPreAuthenticationToken.mutate(
                {preAuthenticationToken: flowInitResult.preAuthenticationToken},
              )
            if (result.isError) {
              if (result.error === 'invalidPreAuthenticationToken') {
                console.error(result)
                continue outer
              } else if (result.error === 'userDeniedLogin') {
                return {success: false, error: 'userDeniedLogin'}
              } else if (result.error === 'notYetReady') {
                continue inner
              } else {
                const msg = `Unknown error returned from app-studio-trpc: ${result.error} - ${result.errorMessage}`
                console.error(msg)
                return {success: false, error: 'unknown', msg}
              }
            } else if (result.clientFlowToken !== clientFlowToken) {
              console.warn('The user returend an invalid clientFlowToken')
              console.error(result)

              // TODO report this?
              continue outer
            } else {
              this._persistentState.set({
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
              })
              return {success: true}
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
      } finally {
        this._ephemeralState.setByPointer((p) => p.authFlowState, undefined)
      }
    }
    return {success: false, error: 'unknown'}
  }

  async deauthenticate() {
    if (this._ephemeralState.get().authFlowState) {
      throw new Error('Already authenticating')
    }
    const authState = this._persistentState.get()
    if (!authState) {
      throw new Error('Not authenticated')
    }

    this._persistentState.set(undefined)

    await (
      await this._appLink
    ).api.studioAuth.invalidateRefreshToken.mutate({
      refreshToken: authState.refreshToken,
    })
  }

  /**
   * Resolves with the access token. If no token is set, it'll wait until one is. Note that this will _NOT_ trigger authentication,
   * so if this function is called and the user is not authenticated, it'll wait forever.
   */
  private async _getValidAccessToken(): Promise<string> {
    // no ongoing authentication atm
    if (!this._ephemeralState.get().authFlowState) {
      const authState = this._persistentState.get()
      // and the access token is available
      if (authState) {
        return authState.accessToken
      } else {
        throw new Error('Not authenticated')
      }
    } else {
      const accessToken = await this._waitForAccessToken()
      return accessToken
    }
  }

  private async _waitForAccessToken(): Promise<string> {
    const accessToken = await waitForPrism(
      prism<undefined | string>(() => {
        if (!val(this._ephemeralState.pointer.ready)) {
          return undefined
        }

        if (val(this._ephemeralState.pointer.authFlowState) !== undefined) {
          return undefined
        }

        const authState = val(this._persistentState.pointer)
        if (!authState) {
          return undefined
        } else {
          return authState.accessToken
        }
      }),
      (v) => v !== undefined,
    )
    return accessToken!
  }

  async waitUntilAuthenticated(): Promise<void> {
    await this.ready
    await this._waitForAccessToken()
  }

  async _refreshAccessToken() {
    const authState = this._persistentState.get()
    if (!authState) {
      throw new Error('Not authenticated')
    }

    const result = await (
      await this._appLink
    ).api.studioAuth.refreshAccessToken.mutate({
      refreshToken: authState.refreshToken,
    })

    if (result.isError) {
      if (result.error === 'invalidRefreshToken') {
        this._persistentState.set(undefined)
        throw new Error('Invalid refresh token')
      } else {
        throw new Error(
          `Unknown error returned from app-studio-trpc: ${result.error} - ${result.errorMessage}`,
        )
      }
    } else {
      this._persistentState.set({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
    }
  }

  private async _wrapTrpcProcedureWithAuth<
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
    await this.authenticate({skipIfAlreadyAuthenticated: true})
    const accessToken = await this._waitForAccessToken()
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
        await this._refreshAccessToken()
        return this._wrapTrpcProcedureWithAuth(fn, args, path, retriesLeft - 1)
      } else {
        return Promise.reject(err)
      }
    }
  }
}

type AnyFn = (...args: any[]) => any

function wrapTrpcClientWithAuth<Client extends {}>(
  clientPromise: Promise<Client>,
  enhancer: (originalFn: AnyFn, args: any[], path: string[]) => any,
): TrpcClientWrapped<Client> {
  const handlers = {
    get: (target: PathedTarget, prop: string): any => {
      const subTarget: PathedTarget = (() => {}) as $IntentionalAny
      subTarget.path = [...target.path, prop]

      if (prop === 'query' || prop === 'mutate' || prop === 'subscribe') {
        return proxyProcedure(subTarget, prop)
      } else {
        return new Proxy(subTarget, handlers)
      }
    },
  }

  const proxyProcedure = (target: PathedTarget, prop: string) => {
    return new Proxy(target, {
      apply: async (_target: PathedTarget, thisArg: any, argArray: any) => {
        const client = await clientPromise
        const fn = get(client, target.path)
        return await enhancer(fn, argArray, target.path)
      },
      ...handlers,
    })
  }

  type PathedTarget = {path: string[]} & (() => {})
  const rootTarget: PathedTarget = (() => {}) as $IntentionalAny
  rootTarget.path = []

  const pr = new Proxy(rootTarget, handlers)
  return pr as $IntentionalAny
}

type TrpcClientWrapped<Client extends {}> = {
  [K in keyof Client]: K extends 'query' | 'mutate' | 'subscribe'
    ? TrpcProcedureWrapped<Client[K]>
    : Client[K] extends {}
    ? TrpcClientWrapped<Client[K]>
    : Client[K]
}

type TrpcProcedureWrapped<Procedure extends any> = Procedure extends (
  input: infer OriginalInput,
) => infer Ret
  ? (input: Omit<OriginalInput, 'studioAuth'>) => Ret
  : Procedure extends (
      input: infer OriginalInput,
      secondArg: infer SecondArg,
    ) => infer Ret
  ? (input: Omit<OriginalInput, 'studioAuth'>, secondArg: SecondArg) => Ret
  : Procedure

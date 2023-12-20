import {get} from 'lodash-es'
import type {$IntentionalAny} from '@theatre/core/types/public'

type AnyFn = (...args: any[]) => any

export function wrapTrpcClientWithAuth<Client extends {}>(
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

export type TrpcClientWrapped<Client extends {}> = {
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

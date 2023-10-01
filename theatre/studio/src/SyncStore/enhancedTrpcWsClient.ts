
export default function enhancedTrpcWsClient<
  Client extends {},
  GetOpts extends () => any,
>(
  clinet: Client,
  getOpts: GetOpts,
): EnhancedTrpcWsClient<Client, ReturnType<GetOpts>> {
  const handlers = {
    get: (target: any, prop: string): any => {
      console.log(`prop`, prop)
      if (prop === 'query' || prop === 'mutation' || prop === 'subscription') {
        return proxyProcedure(target, prop)
      } else if (target[prop] && typeof target[prop] === 'object') {
        return new Proxy(target[prop], handlers)
      } else {
        return target[prop]
      }
    },
  }

  const proxyProcedure = (target: any, prop: string) => {
    return new Proxy(target[prop], {
      apply: (_target: any, thisArg: any, argArray: any) => {
        const [originalOpts, ...restArgs] = argArray
        const opts = {...getOpts(), ...originalOpts}
        console.log(`prx`, target)
        return target[prop](opts, ...restArgs)
      },
      ...handlers,
    })
  }

  const pr = new Proxy(clinet, handlers)
  return pr
}

export type EnhancedTrpcWsClient<Client extends {}, EnhancedOpts extends {}> = {
  [K in keyof Client]: K extends 'query' | 'mutation' | 'subscription'
    ? EnhancedProcedure<Client[K], EnhancedOpts>
    : Client[K] extends {}
    ? EnhancedTrpcWsClient<Client[K], EnhancedOpts>
    : Client[K]
}

type EnhancedProcedure<
  Procedure extends any,
  EnhancedOpts extends {},
> = Procedure extends (
  opts: infer OriginalOpts,
  ...rest: infer Rest
) => infer Ret
  ? (opts: Omit<OriginalOpts, keyof EnhancedOpts>, ...rest: Rest) => Ret
  : Procedure

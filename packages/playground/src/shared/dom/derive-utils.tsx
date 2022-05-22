import type {IDerivation} from '@theatre/dataverse'
import {isDerivation} from '@theatre/dataverse'
import {prism} from '@theatre/dataverse'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import React, {useCallback, useEffect, useMemo} from 'react'
import {objMap} from './LoggerIncludesMenu'
import {useTicker} from './useTicker'

type DeriveAll<T> = IDerivation<
  {
    [P in keyof T]: T[P] extends IDerivation<infer R> ? R : never
  }
>
export function deriveAllD<T extends [...IDerivation<any>[]]>(
  obj: T,
): DeriveAll<T>
export function deriveAllD<T extends Record<string, IDerivation<any>>>(
  obj: T,
): DeriveAll<T> {
  const value = prism(() => {
    if (Array.isArray(obj)) {
      return obj.map((d) => d.getValue())
    } else {
      // isDerivation check might not be necessary based on types
      return objMap(obj, ([_k, d]) =>
        isDerivation(d) ? d.getValue() : undefined,
      )
    }
  })

  return value as DeriveAll<T>
}

export function reactD<T>(
  der: IDerivation<T>,
  render: DeriveRenderFn<T>,
): JSX.Element {
  return <DeriveElement der={der} render={render} />
}

export function childD(der: IDerivation<ValidJSXChild>): JSX.Element {
  return <DeriveElement der={der} render={undefined} />
}

export type ValidJSXChild = React.ReactChild | JSX.Element | JSX.Element[]
export type DeriveRenderFn<T> =
  | (T extends ValidJSXChild ? void : never)
  | ((value: T) => ValidJSXChild)

function DeriveElement<T>(props: {
  der: IDerivation<T>
  render: DeriveRenderFn<T>
}) {
  const value = useDerivation(props.der)
  return <>{props.render != null ? props.render(value) : value}</>
}

// this derivation is pretty much "hot"
export function useDerivation<T>(der: IDerivation<T>): T {
  const ticker = useTicker()
  const [valueRef, value] = useRefAndState(() => der.getValue())
  useEffect(() => {
    return der.changes(ticker).tap((value) => {
      valueRef.current = value
    })
  }, [ticker, der])
  return value
}

// this derivation is pretty much "hot"
export function usePrism<T>(fn: () => T, deps: any[]): T {
  fn = useCallback(fn, deps)
  const der = useMemo(() => prism(fn), [fn])
  return useDerivation(der)
}

import {useRef, useState, createElement} from 'react'
import {useUnmount} from '$shared/utils/react/hooks'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import {useContext} from 'react'
import {TickerContext} from '../../utils/react/TickerContext'
import {VoidFn} from '$shared/types'
import {forwardRef, memo} from 'react'
import {useForceUpdate} from '../../utils/react/hooks'
import DerivationAsReactElement from '$shared/utils/react/DerivationAsReactElement'

export function printDebugValue(v: React.MutableRefObject<$FixMe | null>) {
  if (!v.current) {
    return '<unknown>'
  }
  return '<unknown>'
  // return getDependencyTree(v.current)
}

export function useObservedDerivation<T>(fn: () => T): T {
  const forceUpdate = useForceUpdate()

  const stuffRef = useRef<null | {
    derivation: AbstractDerivation<T>
    untap: VoidFn,
    fn: () => T
  }>(null)

  if (stuffRef.current && stuffRef.current.fn !== fn) {
    stuffRef.current.untap()
    stuffRef.current = null
  }

  if (!stuffRef.current) {
    const derivation = autoDerive(fn)
    const untap = derivation.changesWithoutValues().tap(forceUpdate)

    stuffRef.current = {
      derivation,
      untap,
      fn,
    }
  }

  useUnmount(() => {
    stuffRef.current!.untap()
  })

  return stuffRef.current!.derivation.getValue()
}

export function autoDeriveElement(fn: () => React.ReactNode): JSX.Element {
  const stuffRef = useRef<null | {
    derivation: AbstractDerivation<React.ReactNode>
    fn: () => React.ReactNode
  }>(null)

  if (stuffRef.current && stuffRef.current.fn !== fn) {
    stuffRef.current = null
  }

  if (!stuffRef.current) {
    const derivation = autoDerive(fn)

    stuffRef.current = {
      derivation,
      fn,
    }
  }

  return createElement(DerivationAsReactElement, {
    derivation: stuffRef.current!.derivation,
  })
}

export interface IObserverOptions {
  readonly forwardRef?: boolean
}

export function observer<P extends object, TRef = {}>(
  baseComponent: React.RefForwardingComponent<TRef, P>,
  options: IObserverOptions & {forwardRef: true},
): React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<TRef>
  >
>
export function observer<P extends object>(
  baseComponent: React.FunctionComponent<P>,
  options?: IObserverOptions,
): React.NamedExoticComponent<P>
// n.b. base case is not used for actual typings or exported in the typing files
export function observer<P extends object, TRef = {}>(
  baseComponent: React.RefForwardingComponent<TRef, P>,
  options?: IObserverOptions,
) {
  const realOptions = {
    forwardRef: false,
    ...options,
  }

  const baseComponentName = baseComponent.displayName || baseComponent.name

  const wrappedComponent = (props: P, ref: React.Ref<TRef>) => {
    return useObservedDerivation(() => baseComponent(props, ref))
  }

  // @ts-ignore ignore
  wrappedComponent.displayName = baseComponentName

  // memo; we are not intested in deep updates
  // in props; we assume that if deep objects are changed,
  // this is in observables, which would have been tracked anyway
  let memoComponent
  if (realOptions.forwardRef) {
    // we have to use forwardRef here because:
    // 1. it cannot go before memo, only after it
    // 2. forwardRef converts the function into an actual component, so we can't let the baseComponent do it
    //    since it wouldn't be a callable function anymore
    memoComponent = memo(forwardRef(wrappedComponent))
  } else {
    memoComponent = memo(wrappedComponent)
  }

  copyStaticProperties(baseComponent, memoComponent)
  memoComponent.displayName = baseComponentName

  return memoComponent
}

// based on https://github.com/mridgway/hoist-non-react-statics/blob/master/src/index.js
const hoistBlackList: any = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
}

function copyStaticProperties(base: any, target: any) {
  Object.keys(base).forEach(key => {
    if (base.hasOwnProperty(key) && !hoistBlackList[key]) {
      Object.defineProperty(
        target,
        key,
        Object.getOwnPropertyDescriptor(base, key)!,
      )
    }
  })
}

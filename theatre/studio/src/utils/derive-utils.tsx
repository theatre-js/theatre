import {isDerivation, prism, val} from '@theatre/dataverse'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React, {useMemo, useRef} from 'react'
import {invariant} from './invariant'

type DeriveAll<T> = IDerivation<
  {
    [P in keyof T]: T[P] extends $<infer R> ? R : never
  }
>

export type $<T> = IDerivation<T> | Pointer<T>

function deriveAllD<T extends [...$<any>[]]>(obj: T): DeriveAll<T>
function deriveAllD<T extends Record<string, $<any>>>(obj: T): DeriveAll<T>
function deriveAllD<T extends Record<string, $<any>> | $<any>[]>(
  obj: T,
): DeriveAll<T> {
  return prism(() => {
    if (Array.isArray(obj)) {
      const values = new Array(obj.length)
      for (let i = 0; i < obj.length; i++) {
        values[i] = obj[i].getValue()
      }
      return values
    } else {
      const values: $IntentionalAny = {}
      for (const k in obj) {
        values[k] = val((obj as Record<string, $<any>>)[k])
      }
      return values
    }
  }) as $IntentionalAny
}

export function prismRender(
  fn: () => React.ReactNode,
  deps: any[],
): React.ReactElement {
  return <DeriveElement fn={fn} deps={deps} />
}

function DeriveElement(props: {fn: () => React.ReactNode; deps?: any[]}) {
  const node = usePrism(props.fn, props.deps ?? [])
  return <>{node}</>
}

/** This is only used for type checking to make sure the APIs are used properly */
interface TSErrors<M> extends Error {}

type ReactDeriver<Props extends {}> = (
  props: {
    [P in keyof Props]: Props[P] extends IDerivation<infer _>
      ? TSErrors<"Can't both use Derivation properties while wrapping with deriver">
      : Props[P] | IDerivation<Props[P]>
  },
) => React.ReactElement | null

/**
 * Wrap up the component to enable it to take derivable properties.
 * Invoked similarly to `React.memo`.
 *
 * @remarks
 * This is an experimental interface for wrapping components in a version
 * which allows you to pass in derivations for any of the properties that
 * previously took only values.
 */
export function deriver<Props extends {}>(
  Component: React.ComponentType<Props>,
): ReactDeriver<Omit<Props, keyof JSX.IntrinsicAttributes>> {
  const finalComp = React.memo(
    React.forwardRef(function deriverRender(
      props: Record<string, $IntentionalAny>,
      ref,
    ) {
      let observableArr = []
      let normalArr = []
      const observables: Record<string, IDerivation<$IntentionalAny>> = {}
      const normalProps: Record<string, $IntentionalAny> = {
        ref,
      }
      for (const key in props) {
        const value = props[key]
        if (isDerivation(value)) {
          observableArr.push(value)
          observables[key] = value
        } else {
          normalArr.push(value)
          normalProps[key] = value
        }
      }

      const initialCount = useRef(observableArr.length)
      invariant(
        initialCount.current === observableArr.length,
        `expect same number of observable props on every invocation of deriver wrapped component.`,
        {initial: initialCount.current, count: observableArr.length},
      )

      const allD = useMemo(() => deriveAllD(observables), observableArr)

      return prismRender(
        () =>
          React.createElement(Component, {
            ...(normalProps as Props),
            ...(allD.getValue() as Props),
          }),
        [allD, ...normalArr],
      )
    }),
  )

  finalComp.displayName = `deriver(${Component.displayName})`

  return finalComp
}

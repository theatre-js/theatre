import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React, {useLayoutEffect, useRef, useState} from 'react'
import type {Observable} from 'rxjs'
import {isObservable} from 'rxjs'
import {dev} from '@theatre/studio/utils/DevString'
import {invariant} from '@theatre/studio/utils/invariant'
import {combineLatestObj} from './combineLatestObj'
import type {TSErrors} from '@theatre/studio/utils/mvvm/rxjs-mvvm'

type React$<Props extends {}> = (
  props: {
    [P in keyof Props]: Props[P] extends Observable<infer _>
      ? TSErrors<"Can't both use Obervable properties while wrapping with react$">
      : Props[P] | Observable<Props[P]>
  },
) => React.ReactElement | null

export function react$<Props extends {}>(
  component: React.ComponentClass<Props> | React.FunctionComponent<Props>,
): React$<Props> {
  return React.forwardRef(function react$render(
    props: Record<string, $IntentionalAny>,
    ref,
  ) {
    let observableArr = []
    const observables: Record<string, Observable<$IntentionalAny>> = {}
    const normalProps: Record<string, $IntentionalAny> = {}
    for (const key in props) {
      const value = props[key]
      if (isObservable(value)) {
        observableArr.push(value)
        observables[key] = value
      } else {
        normalProps[key] = value
      }
    }

    const initialCount = useRef(observableArr.length)
    invariant(
      initialCount.current === observableArr.length,
      dev`expect same number of observable props on every invocation of react$ wrapped component.`,
      {initial: initialCount.current, count: observableArr.length},
    )

    const [observedPropState, setObservedPropState] =
      useState<$IntentionalAny>(null)
    useLayoutEffect(() => {
      // ignore deprecated, since we do ensure this is torn down by useEffect
      const sub = combineLatestObj(observables).subscribe((observedProps) => {
        setObservedPropState(observedProps)
      })
      return () => sub.unsubscribe()
    }, observableArr)

    return (
      observedPropState &&
      React.createElement(component, {
        ref,
        ...normalProps,
        ...observedPropState,
      })
    )
  })
}

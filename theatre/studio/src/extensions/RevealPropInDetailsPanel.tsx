import type {PropAddress} from '@theatre/shared/utils/addresses'
import React, {useContext, useMemo} from 'react'
import type {DevString} from '@theatre/studio/utils/DevString'
import type {Observable} from 'rxjs'
import {Subject} from 'rxjs'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'

export type RevealPropInDetailsPanel = {
  reveal(prop: PropAddress): void
}

const context = React.createContext<{
  create(debugName: DevString): RevealPropInDetailsPanel
  requests$: Observable<PropAddress>
}>(null!)

export function useRevealPropInDetailsPanel(
  debugName: DevString,
): RevealPropInDetailsPanel {
  const inner = useContext(context)
  return useMemo(() => inner.create(debugName), [debugName, inner])
}

export function ProvideRevealPropInDetailsPanel(
  props: React.PropsWithChildren<{}>,
) {
  const $reveal$ = new Subject<{addr: PropAddress; debugName: DevString}>()
  const revealProp$ = $reveal$.map$((a) => a.addr)
  const logger = useLogger('ProvideRevealPropInDetailsPanel')
  return (
    <context.Provider
      value={{
        create(debugName) {
          return {
            reveal(prop) {
              $reveal$.next({addr: prop, debugName})
              logger._debug('reveal', {prop, debugName})
            },
          }
        },
        requests$: revealProp$,
      }}
      children={props.children}
    />
  )
}

export function useRevealPropInDetailsPanelRevealer(): Observable<PropAddress> {
  return useContext(context).requests$
}

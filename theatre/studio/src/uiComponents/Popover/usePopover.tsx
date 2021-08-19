import React, {useCallback, useContext, useState} from 'react'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'
import TooltipWrapper from './TooltipWrapper'

type OpenFn = (e: React.MouseEvent, target: HTMLElement) => void
type CloseFn = () => void
type State =
  | {isOpen: false}
  | {
      isOpen: true
      clickPoint: {
        clientX: number
        clientY: number
      }
      target: HTMLElement
    }

export default function usePopover(
  opts: {
    closeWhenPointerIsDistant?: boolean
    pointerDistanceThreshold?: number
  },
  render: () => React.ReactElement,
): [node: React.ReactNode, open: OpenFn, close: CloseFn, isOpen: boolean] {
  const [state, setState] = useState<State>({
    isOpen: false,
  })

  const open = useCallback<OpenFn>((e, target) => {
    setState({
      isOpen: true,
      clickPoint: {clientX: e.clientX, clientY: e.clientY},
      target,
    })
  }, [])

  const close = useCallback<CloseFn>(() => {
    setState({isOpen: false})
  }, [])

  const portalLayer = useContext(PortalContext)

  const node = state.isOpen ? (
    createPortal(
      <TooltipWrapper children={render} target={state.target} />,
      portalLayer!,
    )
  ) : (
    <></>
  )

  return [node, open, close, state.isOpen]
}

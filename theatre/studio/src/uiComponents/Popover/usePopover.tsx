import React, {useCallback, useContext, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'
import TooltipWrapper from './TooltipWrapper'

export type OpenFn = (e: React.MouseEvent, target: HTMLElement) => void
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
    closeOnClickOutside?: boolean
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
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

  const onClickOutside = useCallback(() => {
    if (opts.closeOnClickOutside !== false) {
      close()
    }
  }, [opts.closeOnClickOutside])

  const portalLayer = useContext(PortalContext)
  const onPointerOutside = useMemo(() => {
    if (opts.closeWhenPointerIsDistant === false) return undefined
    return {
      threshold: opts.pointerDistanceThreshold ?? 100,
      callback: close,
    }
  }, [opts.closeWhenPointerIsDistant])

  const node = state.isOpen ? (
    createPortal(
      <TooltipWrapper
        children={render}
        target={state.target}
        onClickOutside={onClickOutside}
        onPointerOutside={onPointerOutside}
        constraints={{
          minX: opts.minX,
          maxX: opts.maxX,
          minY: opts.minY,
          maxY: opts.maxY,
        }}
      />,
      portalLayer!,
    )
  ) : (
    <></>
  )

  return [node, open, close, state.isOpen]
}

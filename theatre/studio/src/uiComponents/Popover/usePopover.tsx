import React, {useCallback, useState} from 'react'
import Popover from './Popover'

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
  render: () => React.ReactNode,
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

  const node = state.isOpen ? (
    <Popover
      children={render}
      clickPoint={state.clickPoint}
      target={state.target}
      onPointerOutOfThreshold={close}
    />
  ) : (
    <></>
  )

  return [node, open, close, state.isOpen]
}

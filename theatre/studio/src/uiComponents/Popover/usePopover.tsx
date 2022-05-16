import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {createPortal} from 'react-dom'
import {PortalContext} from 'reakit'
import type {AbsolutePlacementBoxConstraints} from './TooltipWrapper'
import TooltipWrapper from './TooltipWrapper'

export type OpenFn = (
  e: React.MouseEvent | MouseEvent | {clientX: number; clientY: number},
  target: HTMLElement,
) => void
type CloseFn = (reason: string) => void
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

const PopoverAutoCloseLock = React.createContext({
  // defaults have no effects, since there would not be a
  // parent popover to worry about auto-closing.
  takeFocus() {
    return {
      releaseFocus() {},
    }
  },
})

export default function usePopover(
  opts: {
    debugName: string
    closeWhenPointerIsDistant?: boolean
    pointerDistanceThreshold?: number
    closeOnClickOutside?: boolean
    constraints?: AbsolutePlacementBoxConstraints
  },
  render: () => React.ReactElement,
): [node: React.ReactNode, open: OpenFn, close: CloseFn, isOpen: boolean] {
  const _debug = (...args: any) => {} // console.debug.bind(console, opts.debugName)

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

  const close = useCallback<CloseFn>((reason) => {
    _debug(`closing due to "${reason}"`)
    setState({isOpen: false})
  }, [])

  /**
   * See doc comment on {@link useAutoCloseLockState}.
   * Used to ensure that moving far away from a parent popover doesn't
   * close a child popover.
   */
  const lock = useAutoCloseLockState({
    _debug,
    state,
  })

  const onClickOutside = useCallback(() => {
    if (lock.childHasFocusRef.current) return
    if (opts.closeOnClickOutside !== false) {
      close('clicked outside popover')
    }
  }, [opts.closeOnClickOutside])

  const portalLayer = useContext(PortalContext)
  const onPointerOutside = useMemo(() => {
    if (opts.closeWhenPointerIsDistant === false) return undefined
    return {
      threshold: opts.pointerDistanceThreshold ?? 100,
      callback: () => {
        if (lock.childHasFocusRef.current) return
        close('pointer outside')
      },
    }
  }, [opts.closeWhenPointerIsDistant])

  const node = state.isOpen ? (
    createPortal(
      <PopoverAutoCloseLock.Provider value={lock.childPopoverLock}>
        <TooltipWrapper
          children={render}
          target={state.target}
          onClickOutside={onClickOutside}
          onPointerOutside={onPointerOutside}
          constraints={opts.constraints}
        />
      </PopoverAutoCloseLock.Provider>,
      portalLayer!,
    )
  ) : (
    <></>
  )

  return [node, open, close, state.isOpen]
}

/**
 * Keep track of the current lock state, and provide
 * a lock that can be passed down to popover children.
 *
 * Used to ensure that moving far away from a parent popover doesn't
 * close a child popover.
 * When child popovers are opened, we want to suspend all auto-closing
 * behaviors for parenting popovers.
 */
function useAutoCloseLockState(options: {
  state: State
  _debug: (message: string, args?: object) => void
}) {
  const parentLock = useContext(PopoverAutoCloseLock)

  useEffect(() => {
    if (options.state.isOpen) {
      // when this "popover" is open, then take focus from parent
      const focused = parentLock.takeFocus()
      options._debug('take focus')
      return () => {
        // when closed / unmounted, release focus
        options._debug('release focus')
        focused.releaseFocus()
      }
    }
  }, [options.state.isOpen])

  // child of us
  const childHasFocusRef = useRef(false)
  return {
    childHasFocusRef: childHasFocusRef,
    childPopoverLock: {
      takeFocus() {
        childHasFocusRef.current = true
        return {
          releaseFocus() {
            childHasFocusRef.current = false
          },
        }
      },
    },
  }
}

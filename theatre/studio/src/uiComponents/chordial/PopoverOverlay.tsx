import React from 'react'
import {usePrism} from '@theatre/react'
import type {ChodrialElement, InvokeTypePopover} from './chordialInternals'
import {val} from '@theatre/dataverse'
import {popoverActor} from './popoverActor'
import PopoverPositioner from '@theatre/studio/uiComponents/Popover/PopoverPositioner'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'

export const PopoverOverlay: React.FC<{}> = () => {
  const s = usePrism(():
    | undefined
    | ({
        originalTriggerEvent: MouseEvent | undefined
        element: ChodrialElement
        domEl: Element
      } & InvokeTypePopover) => {
    const status = val(popoverActor.pointer)
    if (!status) return undefined

    const domEl = status.element.target

    if (!(domEl instanceof Element)) {
      return undefined
    }

    const optsFn = val(status.element.atom.pointer.optsFn)
    const opts = optsFn()
    const {invoke} = opts
    if (invoke && typeof invoke !== 'function' && invoke.type === 'popover') {
      return {
        ...invoke,
        domEl,
        originalTriggerEvent: status.originalTriggerEvent,
        element: status.element,
      }
    } else {
      return undefined
    }
  }, [])

  const {isPointerBeingCaptured} = usePointerCapturing(`PopoverOverlay`)

  if (!s) return null

  const close = () => {
    popoverActor.send({type: 'close', el: s.element})
  }

  const onPointerOutside =
    s.closeWhenPointerIsDistant === false
      ? undefined
      : {
          threshold: s.pointerDistanceThreshold ?? 100,
          callback: () => {
            // if (lock.childHasFocusRef.current) return
            // this is a bit weird, because when you stop capturing, then the popover can close on you...
            // TODO: Better fixes?
            if (isPointerBeingCaptured()) return
            close()
          },
        }

  return (
    <PopoverPositioner
      children={() => s.render({close})}
      target={s.domEl}
      onClickOutside={close}
      onPointerOutside={onPointerOutside}
      constraints={s.constraints}
      verticalGap={s.verticalGap}
    />
  )
}

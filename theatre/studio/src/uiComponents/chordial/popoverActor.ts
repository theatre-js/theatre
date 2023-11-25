import {basicFSM} from '@theatre/utils/basicFSM'
import type {ChodrialElement, InvokeTypePopover} from './chordialInternals'
import {prism, val} from '@theatre/dataverse'

export const popoverActor = basicFSM<
  | {type: 'open'; el: ChodrialElement; triggerEvent: MouseEvent | undefined}
  | {type: 'close'; el: ChodrialElement},
  | ({
      element: ChodrialElement
      originalTriggerEvent: MouseEvent | undefined
    } & InvokeTypePopover)
  | undefined
>((transition) => {
  function idle() {
    transition('idle', undefined, (e) => {
      switch (e.type) {
        case 'open':
          const {el} = e
          const {invoke} = el.atom.get().optsFn()
          if (
            invoke &&
            typeof invoke !== 'function' &&
            invoke.type === 'popover'
          ) {
            active(el, invoke, e.triggerEvent)
          }
          break
        case 'close':
          break
      }
    })
  }

  function active(
    originalEl: ChodrialElement,
    invoke: InvokeTypePopover,
    triggerEvent: MouseEvent | undefined,
  ) {
    const activationTime = Date.now()
    transition(
      'active',
      {element: originalEl, originalTriggerEvent: triggerEvent, ...invoke},
      (e) => {
        switch (e.type) {
          case 'open':
            const {el} = e
            const {invoke} = el.atom.get().optsFn()
            if (
              invoke &&
              typeof invoke !== 'function' &&
              invoke.type === 'popover'
            ) {
              active(el, invoke, e.triggerEvent)
            }
            break
          case 'close':
            if (e.el === originalEl) {
              idle()
            }
            break
        }
      },
    )
  }

  idle()
})()

export const popoverStatus = prism(() => val(popoverActor.pointer))

import {basicFSM} from '@theatre/utils/basicFSM'
import type {MaybeChodrialEl, ChodrialElement} from './chordialInternals'
import {prism, val} from '@theatre/dataverse'
import {contextActor} from './contextActor'
import {hoverActor} from './hoverActor'
import {mousedownActor} from './mousedownActor'

/**
 * A state machine that determines which Chordial target should have a tooltip shown.
 */
export const tooltipActor = basicFSM<
  | {type: 'hoverTargetChange'; element: MaybeChodrialEl}
  // emitted when the mouse button is down, or some other gesture is active so that the tooltip must not be shown
  | {type: 'tooltipBlocked'}
  | {type: 'tooltipUnblocked'},
  MaybeChodrialEl
>((transition) => {
  function tooltipBlocked() {
    transition('tooltipBlocked', undefined, (e) => {
      switch (e.type) {
        case 'tooltipUnblocked':
          idle()
          break
        default:
          return
      }
    })
  }

  const wrap = (
    stateName: string,
    context: MaybeChodrialEl,
    take: (newHover: MaybeChodrialEl) => void,
  ): {isActive: boolean} => {
    const status = {isActive: true}
    transition(stateName, context, (e) => {
      switch (e.type) {
        case 'tooltipBlocked':
          status.isActive = false
          tooltipBlocked()
          break
        case 'hoverTargetChange':
          take(e.element)
          break
        default:
          // ?
          break
      }
    })
    return status
  }

  function idle() {
    wrap('idle', undefined, (newHover: MaybeChodrialEl) => {
      if (!newHover) return
      waitingForActive(newHover)
    })
  }

  // a 1s timeout before showing the tooltip
  function waitingForActive(originalHover: ChodrialElement) {
    const timeout = setTimeout(() => {
      if (status.isActive) active(originalHover)
    }, 1200)

    const status = wrap('waitingForActive', undefined, (newHover) => {
      clearTimeout(timeout)
      if (newHover) {
        waitingForActive(newHover)
      } else {
        idle()
      }
    })
  }

  function active(currentHover: ChodrialElement) {
    wrap('active', currentHover, (newHover) => {
      if (newHover) {
        active(newHover)
      } else {
        waitingForIdle(currentHover)
      }
    })
  }

  function waitingForIdle(currentHover: ChodrialElement) {
    const timeout = setTimeout(() => {
      if (status.isActive) waitingForRevive()
    }, 200)
    const status = wrap('waitingForIdle', currentHover, (newHover) => {
      if (!newHover) return
      clearTimeout(timeout)
      active(newHover)
    })
  }

  function waitingForRevive() {
    const timeout = setTimeout(() => {
      if (status.isActive) idle()
    }, 300)

    const status = wrap('waitingForRevive', undefined, (newHover) => {
      if (!newHover) return
      clearTimeout(timeout)
      active(newHover)
    })
  }

  idle()
})({name: 'tooltipActor'})

const isTooltipBlocked = prism(() => {
  const isContextMenuOpen = !!val(contextActor.pointer)
  const isMouseDown = val(mousedownActor.pointer)

  return isContextMenuOpen || isMouseDown
})
isTooltipBlocked.onStale(() => {
  tooltipActor.send({
    type: val(isTooltipBlocked) ? 'tooltipBlocked' : 'tooltipUnblocked',
  })
})

const activeHoverTarget = prism(() => val(hoverActor.pointer))

activeHoverTarget.onStale(() => {
  tooltipActor.send({
    type: 'hoverTargetChange',
    element: activeHoverTarget.getValue(),
  })
})

export const tooltipTarget = prism(() => val(tooltipActor.pointer))

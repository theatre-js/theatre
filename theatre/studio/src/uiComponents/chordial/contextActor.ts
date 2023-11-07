import {basicFSM} from '@theatre/utils/basicFSM'
import type {ChodrialElement} from './chordialInternals'
import {findChodrialByDomNode} from './chordialInternals'
import {prism, val} from '@theatre/dataverse'

export const contextActor = basicFSM<
  | {type: 'rclick'; mouseEvent: MouseEvent}
  | {type: 'requestClose'; element: ChodrialElement},
  {element: ChodrialElement; originalMouseEvent: MouseEvent} | undefined
>((t) => {
  function idle() {
    t('idle', undefined, (e) => {
      switch (e.type) {
        case 'rclick':
          const chordialEl = findChodrialByDomNode(e.mouseEvent.target)
          if (chordialEl) {
            active(e.mouseEvent, chordialEl)
          }
          break
        default:
          break
      }
    })
  }

  function active(originalEvent: MouseEvent, originalEl: ChodrialElement) {
    originalEvent.preventDefault()
    originalEvent.stopPropagation()
    t(
      'active',
      {element: originalEl, originalMouseEvent: originalEvent},
      (e) => {
        switch (e.type) {
          case 'rclick':
            const newEl = findChodrialByDomNode(e.mouseEvent.target)
            if (!newEl) return idle()
            active(e.mouseEvent, newEl)
            break
          case 'requestClose':
            if (e.element === originalEl) {
              idle()
            }
            break
        }
      },
    )
  }

  idle()
})({name: 'contextActor'})

export const contextStatus = prism(() => val(contextActor.pointer))

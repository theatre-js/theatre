import {basicFSM} from '@theatre/utils/basicFSM'
import type {ChodrialElement} from './chordialInternals';
import { findChodrialByDomNode} from './chordialInternals'

export const hoverActor = basicFSM<
  {type: 'mousemove'; mouseEvent: MouseEvent; source: 'window' | 'root'},
  ChodrialElement | undefined
>((transition) => {
  function idle() {
    transition('idle', undefined, (e) => {
      switch (e.type) {
        case 'mousemove':
          if (e.source === 'window') return
          const chordialEl = findChodrialByDomNode(e.mouseEvent.target)
          if (!chordialEl) return
          active(chordialEl)
          break
      }
    })
  }

  function active(originalEl: ChodrialElement) {
    const activationTime = Date.now()
    transition('active', originalEl, (e) => {
      switch (e.type) {
        case 'mousemove':
          if (e.source === 'window') {
            if (Date.now() - activationTime > 100) {
              idle()
            }
            return
          }

          const newEl = findChodrialByDomNode(e.mouseEvent.target)
          if (newEl === originalEl) {
            active(originalEl)
            return
          }
          if (!newEl) {
            idle()
            return
          }
          active(newEl)
          break
      }
    })
  }

  idle()
})()

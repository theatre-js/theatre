import React from 'react'
import {usePrism, useVal} from '@theatre/react'
import type {ChodrialElement, ChordialOpts} from './chordialInternals'
import {contextActor, contextStatus} from './contextActor'
import ContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/ContextMenu/ContextMenu'
import {val} from '@theatre/dataverse'

export const ContextOverlay: React.FC<{}> = () => {
  const currentStatus = useVal(contextStatus)

  const s = usePrism(():
    | undefined
    | {
        originalMoseEvent: MouseEvent
        opts: ChordialOpts
        element: ChodrialElement
      } => {
    const status = val(contextStatus)
    if (!status) return undefined
    const optsFn = val(status.element.atom.pointer.optsFn)
    const opts = optsFn()
    return {
      opts,
      originalMoseEvent: status.originalMouseEvent,
      element: status.element,
    }
  }, [])

  if (!s) return null

  return (
    <ContextMenu
      items={s.opts.items}
      displayName={s.opts.menuTitle ?? s.opts.title}
      clickPoint={s.originalMoseEvent}
      onRequestClose={() => {
        contextActor.send({type: 'requestClose', element: s.element})
      }}
    />
  )
}

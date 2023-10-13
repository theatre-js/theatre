import type {MutableRefObject} from 'react'
import {useContext, useEffect, useRef} from 'react'
import React from 'react'
import {PortalContext} from 'reakit'
import {createPortal} from 'react-dom'
import {TooltipOverlay} from './TooltipOverlay'
import type {ChordialOptsFn, ChodrialElement} from './chordialInternals'
import {createChordialElement, hoverActor} from './chordialInternals'

export default function useChordial<T extends HTMLElement>(
  optsFn: ChordialOptsFn,
): {
  targetRef: MutableRefObject<T | null>
} {
  const refs = useRef<ChodrialElement | undefined>()

  if (!refs.current) {
    refs.current = createChordialElement(optsFn)
  }

  refs.current.atom.setByPointer((p) => p.optsFn, optsFn)

  return refs.current.returnValue
}

export const useChordialCaptureEvents =
  (): React.MutableRefObject<HTMLElement | null> => {
    const ref = useRef<HTMLElement | null>(null)

    useEffect(() => {
      const root = ref.current!
      if (!root) return

      window.addEventListener('mousemove', eventHandlers.windowMouseMove)
      root.addEventListener('contextmenu', eventHandlers.contextMenu)
      root.addEventListener('mousemove', eventHandlers.mouseMove)
      root.addEventListener('mousedown', eventHandlers.mouseDown)
      root.addEventListener('mouseup', eventHandlers.mouseUp)
      root.addEventListener('click', eventHandlers.click)

      return () => {
        root.removeEventListener('mousemove', eventHandlers.windowMouseMove)
        root.removeEventListener('contextmenu', eventHandlers.contextMenu)
        root.removeEventListener('mousemove', eventHandlers.mouseMove)
        root.removeEventListener('mousedown', eventHandlers.mouseDown)
        root.removeEventListener('mouseup', eventHandlers.mouseUp)
        root.removeEventListener('click', eventHandlers.click)
      }
    }, [])
    return ref
  }

export const ChordialRenderer: React.FC<{}> = () => {
  const portalLayer = useContext(PortalContext)

  if (!portalLayer) return null

  return createPortal(
    <>
      <TooltipOverlay />
    </>,
    portalLayer,
  )
}

const eventHandlers = {
  windowMouseMove: (e: MouseEvent) => {
    hoverActor.send([e, 'window'])
  },
  mouseMove: (e: MouseEvent) => {
    hoverActor.send([e, 'root'])
  },
  mouseDown: (e: MouseEvent) => {},
  mouseUp: (e: MouseEvent) => {},
  click: (e: MouseEvent) => {},
  contextMenu: (e: MouseEvent) => {},
}

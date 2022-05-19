import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {panelDimsToPanelPosition, usePanel} from './BasePanel'

const Container = styled.div`
  cursor: move;
`

const PanelDragZone: React.FC<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = (props) => {
  const panelStuff = usePanel()
  const panelStuffRef = useRef(panelStuff)
  panelStuffRef.current = panelStuff

  const [ref, node] = useRefAndState<HTMLDivElement>(null as $IntentionalAny)

  const dragOpts: Parameters<typeof useDrag>[1] = useMemo(() => {
    return {
      debugName: 'PanelDragZone',
      lockCursorTo: 'move',
      onDragStart() {
        const stuffBeforeDrag = panelStuffRef.current
        let tempTransaction: CommitOrDiscard | undefined

        const unlock = panelStuff.addBoundsHighlightLock()

        return {
          onDrag(dx, dy) {
            const newDims: typeof panelStuff['dims'] = {
              ...stuffBeforeDrag.dims,
              top: stuffBeforeDrag.dims.top + dy,
              left: stuffBeforeDrag.dims.left + dx,
            }
            const position = panelDimsToPanelPosition(newDims, {
              width: window.innerWidth,
              height: window.innerHeight,
            })

            tempTransaction?.discard()
            tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
              stateEditors.studio.historic.panelPositions.setPanelPosition({
                position,
                panelId: stuffBeforeDrag.panelId,
              })
            })
          },
          onDragEnd(dragHappened) {
            unlock()
            if (dragHappened) {
              tempTransaction?.commit()
            } else {
              tempTransaction?.discard()
            }
          },
        }
      },
    }
  }, [])

  useDrag(node, dragOpts)

  const [onMouseEnter, onMouseLeave] = useMemo(() => {
    let unlock: VoidFn | undefined
    return [
      function onMouseEnter() {
        if (unlock) {
          const u = unlock
          unlock = undefined
          u()
        }
        unlock = panelStuff.addBoundsHighlightLock()
      },
      function onMouseLeave() {
        if (unlock) {
          const u = unlock
          unlock = undefined
          u()
        }
      },
    ]
  }, [])

  return (
    <Container
      {...props}
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

export default PanelDragZone

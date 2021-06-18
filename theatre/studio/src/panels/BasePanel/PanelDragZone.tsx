import useRefAndState from '@theatre/shared/utils/react/useRefAndState'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
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
    let stuffBeforeDrag = panelStuffRef.current
    let tempTransaction: CommitOrDiscard | undefined
    return {
      lockCursorTo: 'move',
      onDragStart() {
        stuffBeforeDrag = panelStuffRef.current
      },
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
        if (dragHappened) {
          tempTransaction?.commit()
        } else {
          tempTransaction?.discard()
        }
        tempTransaction = undefined
      },
    }
  }, [])

  useDrag(node, dragOpts)

  // @ts-ignore ignore
  return <Container {...props} ref={ref} />
}

export default PanelDragZone

import React from 'react'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import type {IAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import {AggregateKeyframeVisualDot, HitZone} from './AggregateKeyframeVisualDot'

type IAggregateKeyframeDotProps = {
  isDragging: boolean
  editorProps: IAggregateKeyframeEditorProps
  utils: IAggregateKeyframeEditorUtils
}

export function AggregateKeyframeDot(
  props: React.PropsWithChildren<IAggregateKeyframeDotProps>,
) {
  const logger = useLogger('AggregateKeyframeDot')
  const {cur} = props.utils

  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useAggregateKeyframeContextMenu(node, () =>
    logger._debug('Show Aggregate Keyframe', props),
  )

  return (
    <>
      <HitZone
        ref={ref}
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: props.isDragging,
          position: cur.position,
        })}
      />
      <AggregateKeyframeVisualDot
        isAllHere={cur.allHere}
        isSelected={cur.selected}
      />
      {contextMenu}
    </>
  )
}

function useAggregateKeyframeContextMenu(
  target: HTMLDivElement | null,
  debugOnOpen: () => void,
) {
  // TODO: missing features: delete, copy + paste
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      return []
    },
    onOpen() {
      debugOnOpen()
    },
  })
}

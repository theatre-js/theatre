import React from 'react'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {useLogger} from '@theatre/studio/uiComponents/useLogger'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import type {IAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import {AggregateKeyframeVisualDot, HitZone} from './AggregateKeyframeVisualDot'
import getStudio from '@theatre/studio/getStudio'
import {
  copyableKeyframesFromSelection,
  keyframesWithPaths,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import type {KeyframeWithPathToPropFromCommonRoot} from '@theatre/studio/store/types/ahistoric'
import {commonRootOfPathsToProps} from '@theatre/shared/utils/addresses'
import type {ILogger} from '@theatre/shared/logger'
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'

type IAggregateKeyframeDotProps = {
  editorProps: IAggregateKeyframeEditorProps
  utils: IAggregateKeyframeEditorUtils
}

export function AggregateKeyframeDot(
  props: React.PropsWithChildren<IAggregateKeyframeDotProps>,
) {
  const logger = useLogger('AggregateKeyframeDot')
  const {cur} = props.utils

  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useAggregateKeyframeContextMenu(props, logger, node)

  return (
    <>
      <HitZone
        ref={ref}
        // Need this for the dragging logic to be able to get the keyframe props
        // based on the position.
        {...DopeSnap.includePositionSnapAttrs(cur.position)}
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
  props: IAggregateKeyframeDotProps,
  logger: ILogger,
  target: HTMLDivElement | null,
) {
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      // see AGGREGATE_COPY_PASTE.md for explanation of this
      // code that makes some keyframes with paths for copying
      // to clipboard
      const kfs = props.utils.cur.keyframes.reduce(
        (acc, kfWithTrack) =>
          acc.concat(
            keyframesWithPaths({
              ...props.editorProps.viewModel.sheetObject.address,
              trackId: kfWithTrack.track.id,
              keyframeIds: [kfWithTrack.kf.id],
            }) ?? [],
          ),
        [] as KeyframeWithPathToPropFromCommonRoot[],
      )

      const commonPath = commonRootOfPathsToProps(
        kfs.map((kf) => kf.pathToProp),
      )

      const keyframesWithCommonRootPath = kfs.map(({keyframe, pathToProp}) => ({
        keyframe,
        pathToProp: pathToProp.slice(commonPath.length),
      }))

      return [
        {
          label: props.editorProps.selection ? 'Copy (selection)' : 'Copy',
          callback: () => {
            if (props.editorProps.selection) {
              const copyableKeyframes = copyableKeyframesFromSelection(
                props.editorProps.viewModel.sheetObject.address.projectId,
                props.editorProps.viewModel.sheetObject.address.sheetId,
                props.editorProps.selection,
              )
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  copyableKeyframes,
                )
              })
            } else {
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  keyframesWithCommonRootPath,
                )
              })
            }
          },
        },
        {
          label: props.editorProps.selection ? 'Delete (selection)' : 'Delete',
          callback: () => {
            if (props.editorProps.selection) {
              props.editorProps.selection.delete()
            } else {
              getStudio().transaction(({stateEditors}) => {
                for (const kfWithTrack of props.utils.cur.keyframes) {
                  stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                    {
                      ...props.editorProps.viewModel.sheetObject.address,
                      keyframeIds: [kfWithTrack.kf.id],
                      trackId: kfWithTrack.track.id,
                    },
                  )
                }
              })
            }
          },
        },
      ]
    },
    onOpen() {
      logger._debug('Show aggregate keyframe', props)
    },
  })
}

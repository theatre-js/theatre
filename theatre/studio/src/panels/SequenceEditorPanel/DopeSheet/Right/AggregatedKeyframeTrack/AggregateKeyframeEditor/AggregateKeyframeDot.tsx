import React from 'react'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import usePresence, {
  PresenceFlag,
} from '@theatre/studio/uiComponents/usePresence'
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
import type {EditingOptionsTree} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/useSingleKeyframeInlineEditorPopover'
import {useKeyframeInlineEditorPopover} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/useSingleKeyframeInlineEditorPopover'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'

type IAggregateKeyframeDotProps = {
  editorProps: IAggregateKeyframeEditorProps
  utils: IAggregateKeyframeEditorUtils
}

function sheetObjectBuild(
  viewModel: SequenceEditorTree_SheetObject,
  keyframes: KeyframeWithTrack[],
): EditingOptionsTree | null {
  const children = viewModel.children
    .map((a) =>
      a.type === 'propWithChildren'
        ? propWithChildrenBuild(a, keyframes)
        : primitivePropBuild(a, keyframes),
    )
    .filter((a): a is EditingOptionsTree => a !== null)
  if (children.length === 0) return null
  return {
    type: 'sheetObject',
    sheetObject: viewModel.sheetObject,
    children,
  }
}
function propWithChildrenBuild(
  viewModel: SequenceEditorTree_PropWithChildren,
  keyframes: KeyframeWithTrack[],
): EditingOptionsTree | null {
  const children = viewModel.children
    .map((a) =>
      a.type === 'propWithChildren'
        ? propWithChildrenBuild(a, keyframes)
        : primitivePropBuild(a, keyframes),
    )
    .filter((a): a is EditingOptionsTree => a !== null)
  if (children.length === 0) return null
  return {
    type: 'propWithChildren',
    pathToProp: viewModel.pathToProp,
    propConfig: viewModel.propConf,
    children,
  }
}
function primitivePropBuild(
  viewModelLeaf: SequenceEditorTree_PrimitiveProp,
  keyframes: KeyframeWithTrack[],
): EditingOptionsTree | null {
  const keyframe = keyframes.find((kf) => kf.track.id === viewModelLeaf.trackId)
  if (!keyframe) return null
  return {
    type: 'primitiveProp',
    keyframe: keyframe.kf,
    pathToProp: viewModelLeaf.pathToProp,
    propConfig: viewModelLeaf.propConf,
    sheetObject: viewModelLeaf.sheetObject,
    trackId: viewModelLeaf.trackId,
  }
}

export function AggregateKeyframeDot(
  props: React.PropsWithChildren<IAggregateKeyframeDotProps>,
) {
  const logger = useLogger('AggregateKeyframeDot')
  const {cur} = props.utils

  const [inlineEditorPopover, openEditor, _, isInlineEditorPopoverOpen] =
    useKeyframeInlineEditorPopover(
      props.editorProps.viewModel.type === 'sheetObject'
        ? sheetObjectBuild(props.editorProps.viewModel, cur.keyframes)
        : propWithChildrenBuild(props.editorProps.viewModel, cur.keyframes),
    )

  const presence = usePresence(props.utils.itemKey)
  presence.useRelations(
    () =>
      cur.keyframes.map((kf) => ({
        affects: kf.itemKey,
        flag: PresenceFlag.Primary,
      })),
    [
      // Hmm: Is this a valid fix for the changing size of the useEffect's dependency array?
      // also: does it work properly with selections?
      cur.keyframes
        .map((keyframeWithTrack) => keyframeWithTrack.track.id)
        .join('-'),
    ],
  )

  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useAggregateKeyframeContextMenu(props, logger, node)

  return (
    <>
      <HitZone
        ref={ref}
        {...presence.attrs}
        // Need this for the dragging logic to be able to get the keyframe props
        // based on the position.
        {...DopeSnap.includePositionSnapAttrs(cur.position)}
        onClick={(e) => openEditor(e, ref.current!)}
      />
      <AggregateKeyframeVisualDot
        flag={presence.flag}
        isAllHere={cur.allHere}
        isSelected={cur.selected}
      />
      {contextMenu}
      {inlineEditorPopover}
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

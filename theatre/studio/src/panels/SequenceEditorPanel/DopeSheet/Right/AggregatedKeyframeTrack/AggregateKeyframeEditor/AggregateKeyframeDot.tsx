import React from 'react'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import usePresence, {
  PresenceFlag,
} from '@theatre/studio/uiComponents/usePresence'
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
import DopeSnap from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnap'
import type {
  PrimitivePropEditingOptions,
  PropWithChildrenEditingOptionsTree,
  SheetObjectEditingOptionsTree,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/useSingleKeyframeInlineEditorPopover'
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

const isOptionsTreeNodeNotNull = (
  a: PropWithChildrenEditingOptionsTree | PrimitivePropEditingOptions | null,
): a is PropWithChildrenEditingOptionsTree | PrimitivePropEditingOptions =>
  a !== null

function sheetObjectBuild(
  viewModel: SequenceEditorTree_SheetObject,
  keyframes: KeyframeWithTrack[],
): SheetObjectEditingOptionsTree | null {
  const children = viewModel.children
    .map((a) =>
      a.type === 'propWithChildren'
        ? propWithChildrenBuild(a, keyframes)
        : primitivePropBuild(a, keyframes),
    )
    .filter(isOptionsTreeNodeNotNull)
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
): PropWithChildrenEditingOptionsTree | null {
  const children = viewModel.children
    .map((a) =>
      a.type === 'propWithChildren'
        ? propWithChildrenBuild(a, keyframes)
        : primitivePropBuild(a, keyframes),
    )
    .filter(isOptionsTreeNodeNotNull)
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
): PrimitivePropEditingOptions | null {
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
  const {cur} = props.utils

  const inlineEditorPopover = useKeyframeInlineEditorPopover(
    props.editorProps.viewModel.type === 'sheet'
      ? null
      : props.editorProps.viewModel.type === 'sheetObject'
      ? sheetObjectBuild(props.editorProps.viewModel, cur.keyframes)
          ?.children ?? null
      : propWithChildrenBuild(props.editorProps.viewModel, cur.keyframes)
          ?.children ?? null,
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

  const [contextMenu] = useAggregateKeyframeContextMenu(props, node)

  return (
    <>
      <HitZone
        ref={ref}
        {...presence.attrs}
        // Need this for the dragging logic to be able to get the keyframe props
        // based on the position.
        {...DopeSnap.includePositionSnapAttrs(cur.position)}
        onClick={(e) =>
          props.editorProps.viewModel.type !== 'sheet'
            ? inlineEditorPopover.open(e, ref.current!)
            : null
        }
      />
      <AggregateKeyframeVisualDot
        flag={presence.flag}
        isAllHere={cur.allHere}
        isSelected={cur.selected}
      />
      {contextMenu}
      {inlineEditorPopover.node}
    </>
  )
}

function useAggregateKeyframeContextMenu(
  props: IAggregateKeyframeDotProps,
  target: HTMLDivElement | null,
) {
  return useContextMenu(target, {
    displayName: 'Aggregate Keyframe',
    menuItems: () => {
      const viewModel = props.editorProps.viewModel
      const selection = props.editorProps.selection

      return [
        {
          label: selection ? 'Copy (selection)' : 'Copy',
          callback: () => {
            // see AGGREGATE_COPY_PASTE.md for explanation of this
            // code that makes some keyframes with paths for copying
            // to clipboard
            if (selection) {
              const {projectId, sheetId} =
                viewModel.type === 'sheet'
                  ? viewModel.sheet.address
                  : viewModel.sheetObject.address
              const copyableKeyframes = copyableKeyframesFromSelection(
                projectId,
                sheetId,
                selection,
              )
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  copyableKeyframes,
                )
              })
            } else {
              const kfs: KeyframeWithPathToPropFromCommonRoot[] =
                props.utils.cur.keyframes.flatMap(
                  (kfWithTrack) =>
                    keyframesWithPaths({
                      ...kfWithTrack.track.sheetObject.address,
                      trackId: kfWithTrack.track.id,
                      keyframeIds: [kfWithTrack.kf.id],
                    }) ?? [],
                )

              const basePathRelativeToSheet =
                viewModel.type === 'sheet'
                  ? []
                  : viewModel.type === 'sheetObject'
                  ? [viewModel.sheetObject.address.objectKey]
                  : viewModel.type === 'propWithChildren'
                  ? [
                      viewModel.sheetObject.address.objectKey,
                      ...viewModel.pathToProp,
                    ]
                  : [] // should be unreachable unless new viewModel/leaf types are added
              const commonPath = commonRootOfPathsToProps([
                basePathRelativeToSheet,
                ...kfs.map((kf) => kf.pathToProp),
              ])

              const keyframesWithCommonRootPath = kfs.map(
                ({keyframe, pathToProp}) => ({
                  keyframe,
                  pathToProp: pathToProp.slice(commonPath.length),
                }),
              )
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  keyframesWithCommonRootPath,
                )
              })
            }
          },
        },
        {
          label: selection ? 'Delete (selection)' : 'Delete',
          callback: () => {
            if (selection) {
              selection.delete()
            } else {
              getStudio().transaction(({stateEditors}) => {
                for (const kfWithTrack of props.utils.cur.keyframes) {
                  stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                    {
                      ...kfWithTrack.track.sheetObject.address,
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
  })
}

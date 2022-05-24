import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import {usePrism} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import React from 'react'
import PrimitivePropRow from './PrimitivePropRow'
import RightRow from './Row'
import AggregatedKeyframeTrack from './AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {collectAggregateKeyframesInPrism} from './collectAggregateKeyframes'
import {ProvideLogger, useLogger} from '@theatre/studio/uiComponents/useLogger'

export const decideRowByPropType = (
  leaf: SequenceEditorTree_PropWithChildren | SequenceEditorTree_PrimitiveProp,
  layoutP: Pointer<SequenceEditorPanelLayout>,
): React.ReactElement =>
  leaf.type === 'propWithChildren' ? (
    <RightPropWithChildrenRow
      layoutP={layoutP}
      viewModel={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  ) : (
    <PrimitivePropRow
      layoutP={layoutP}
      leaf={leaf}
      key={'prop' + leaf.pathToProp[leaf.pathToProp.length - 1]}
    />
  )

const RightPropWithChildrenRow: React.VFC<{
  viewModel: SequenceEditorTree_PropWithChildren
  layoutP: Pointer<SequenceEditorPanelLayout>
}> = ({viewModel, layoutP}) => {
  const logger = useLogger(
    'RightPropWithChildrenRow',
    viewModel.pathToProp.join(),
  )
  return usePrism(() => {
    const aggregatedKeyframes = collectAggregateKeyframesInPrism(
      logger.utilFor.internal(),
      viewModel,
    )

    const node = (
      <AggregatedKeyframeTrack
        layoutP={layoutP}
        aggregatedKeyframes={aggregatedKeyframes}
        viewModel={viewModel}
      />
    )

    return (
      <ProvideLogger logger={logger}>
        <RightRow
          leaf={viewModel}
          node={node}
          isCollapsed={viewModel.isCollapsed}
        >
          {viewModel.children.map((propLeaf) =>
            decideRowByPropType(propLeaf, layoutP),
          )}
        </RightRow>
      </ProvideLogger>
    )
  }, [viewModel, layoutP])
}

export default RightPropWithChildrenRow

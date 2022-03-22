import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import KeyframeEditor from './KeyframeEditor/KeyframeEditor'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import getStudio from '@theatre/studio/getStudio'

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const BasicKeyframedTrack: React.FC<IProps> = React.memo((props) => {
  const {layoutP, trackData, leaf} = props
  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )
  const {selectedKeyframeIds, selection} = usePrism(() => {
    const selectionAtom = val(layoutP.selectionAtom)
    const selectedKeyframeIds = val(
      selectionAtom.pointer.current.byObjectKey[
        leaf.sheetObject.address.objectKey
      ].byTrackId[leaf.trackId].byKeyframeId,
    )
    if (selectedKeyframeIds) {
      return {
        selectedKeyframeIds,
        selection: val(selectionAtom.pointer.current),
      }
    } else {
      return {selectedKeyframeIds: {}, selection: undefined}
    }
  }, [layoutP, leaf.trackId])

  const [contextMenu] = useBasicKeyframedTrackContextMenu(containerNode, props)

  const keyframeEditors = trackData.keyframes.map((kf, index) => (
    <KeyframeEditor
      keyframe={kf}
      index={index}
      trackData={trackData}
      layoutP={layoutP}
      leaf={leaf}
      key={'keyframe-' + kf.id}
      selection={selectedKeyframeIds[kf.id] === true ? selection : undefined}
    />
  ))

  return (
    <Container ref={containerRef}>
      {keyframeEditors}
      {contextMenu}
    </Container>
  )
})

export default BasicKeyframedTrack

function useBasicKeyframedTrackContextMenu(
  node: HTMLDivElement | null,
  props: IProps,
) {
  return useContextMenu(node, {
    items: () => {
      const selectionPlayheadPosition = window.selectionPlayhead as
        | number
        | undefined
      const selectionKeyframes = window.selectionKeyframes as
        | Array<Keyframe>
        | undefined

      if (
        Array.isArray(selectionKeyframes) &&
        selectionPlayheadPosition !== undefined
      ) {
        return [
          /**
           * Add the ability to paste a selection of keyframes onto a single track
           */
          {
            label: 'Paste Keyframes',
            callback: () => {
              const sheet = val(props.layoutP.sheet)
              const sequence = sheet.getSequence()

              getStudio()!.transaction(({stateEditors}) => {
                for (const keyframe of selectionKeyframes) {
                  const keyframePositionOffset =
                    keyframe.position - selectionPlayheadPosition
                  stateEditors.coreByProject.historic.sheetsById.sequence.setKeyframeAtPosition(
                    {
                      ...props.leaf.sheetObject.address,
                      trackId: props.leaf.trackId,
                      position: sequence.position + keyframePositionOffset,
                      value: keyframe.value,
                      snappingFunction: sequence.closestGridPosition,
                    },
                  )
                }
              })
            },
          },
        ]
      } else {
        return []
      }
    },
  })
}

import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useLayoutEffect, useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {propNameText} from '@theatre/studio/panels/DetailPanel/propEditors/utils/SingleRowPropEditor'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type KeyframeEditor from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/KeyframeEditor'
import {round} from 'lodash-es'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {$IntentionalAny} from '@theatre/shared/utils/types'

const greaterThanZero = (v: number) => isFinite(v) && v > 0

const Container = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  height: 28px;
  align-items: center;
`

const Label = styled.div`
  ${propNameText};
  white-space: nowrap;
`

const CurveEditorPopover: React.FC<
  {
    layoutP: Pointer<SequenceEditorPanelLayout>

    /**
     * Called when user hits enter/escape
     */
    onRequestClose: () => void
  } & Parameters<typeof KeyframeEditor>[0]
> = (props) => {
  const fns = useMemo(() => {
    let tempTransaction: CommitOrDiscard | undefined

    return {
      temporarilySetValue(newCurve: string): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        const args = cssCubicBezierArgsToHandles(newCurve)!
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          const {replaceKeyframes} =
            stateEditors.coreByProject.historic.sheetsById.sequence

          replaceKeyframes({
            ...props.leaf.sheetObject.address,
            snappingFunction: val(props.layoutP.sheet).getSequence()
              .closestGridPosition,
            trackId: props.leaf.trackId,
            keyframes: [
              {
                ...cur,
                handles: [cur.handles[0], cur.handles[1], args[0], args[1]],
              },
              {
                ...next,
                handles: [args[2], args[3], next.handles[2], next.handles[3]],
              },
            ],
          })
        })
      },
      discardTemporaryValue(): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
      },
      permenantlySetValue(newCurve: string): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        const args = cssCubicBezierArgsToHandles(newCurve)!
        getStudio()!.transaction(({stateEditors}) => {
          const {replaceKeyframes} =
            stateEditors.coreByProject.historic.sheetsById.sequence

          replaceKeyframes({
            ...props.leaf.sheetObject.address,
            snappingFunction: val(props.layoutP.sheet).getSequence()
              .closestGridPosition,
            trackId: props.leaf.trackId,
            keyframes: [
              {
                ...cur,
                handles: [cur.handles[0], cur.handles[1], args[0], args[1]],
              },
              {
                ...next,
                handles: [args[2], args[3], next.handles[2], next.handles[3]],
              },
            ],
          })
        })
      },
    }
  }, [props.layoutP, props.index])

  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    inputRef.current!.focus()
    inputRef.current!.setSelectionRange(0, 100)
  }, [])

  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const cssCubicBezierString = keyframesToCssCubicBezierArgs(cur, next)

  return (
    <Container>
      <Label>cubic-bezier{'('}</Label>
      <BasicStringInput
        value={cssCubicBezierString}
        {...fns}
        isValid={isValid}
        inputRef={inputRef}
        onBlur={props.onRequestClose}
      />
      <Label>{')'}</Label>
    </Container>
  )
}

export default CurveEditorPopover

function keyframesToCssCubicBezierArgs(left: Keyframe, right: Keyframe) {
  return [left.handles[2], left.handles[3], right.handles[0], right.handles[1]]
    .map((n) => round(n, 3).toString())
    .join(', ')
}

const isValid = (str: string): boolean => !!cssCubicBezierArgsToHandles(str)

function cssCubicBezierArgsToHandles(
  str: string,
):
  | undefined
  | [
      leftHandle2: number,
      leftHandle3: number,
      rightHandle0: number,
      rightHandle1: number,
    ] {
  if (str.length > 128) {
    // string too long
    return undefined
  }
  const args = str.split(',')
  if (args.length !== 4) return undefined
  const nums = args.map((arg) => {
    return Number(arg.trim())
  })

  if (!nums.every((v) => isFinite(v))) return undefined

  if (nums[0] < 0 || nums[0] > 1 || nums[2] < 0 || nums[2] > 1) return undefined
  return nums as $IntentionalAny
}

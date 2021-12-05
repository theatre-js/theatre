import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useLayoutEffect, useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {propNameText} from '@theatre/studio/panels/DetailPanel/propEditors/utils/SingleRowPropEditor'
import type KeyframeEditor from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/KeyframeEditor'
import {round} from 'lodash-es'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicAutocompleteInput from '@theatre/studio/uiComponents/form/BasicAutocompleteInput'
import fuzzySort from 'fuzzysort'

const presets = [
  {label: 'Linear', value: '0.5, 0.5, 0.5, 0.5'},
  {label: 'Back In Out', value: '0.680, -0.550, 0.265, 1.550'},
  {label: 'Back In', value: '0.600, -0.280, 0.735, 0.045'},
  {label: 'Back Out', value: '0.175, 0.885, 0.320, 1.275'},
  {label: 'Circ In Out', value: '0.785, 0.135, 0.150, 0.860'},
  {label: 'Circ In', value: '0.600, 0.040, 0.980, 0.335'},
  {label: 'Circ Out', value: '0.075, 0.820, 0.165, 1'},
  {label: 'Cubic In Out', value: '0.645, 0.045, 0.355, 1'},
  {label: 'Cubic In', value: '0.550, 0.055, 0.675, 0.190'},
  {label: 'Cubic Out', value: '0.215, 0.610, 0.355, 1'},
  {label: 'Ease Out In', value: '.42, 0, .58, 1'},
  {label: 'Expo In Out', value: '1, 0, 0, 1'},
  {label: 'Expo Out', value: '0.190, 1, 0.220, 1'},
  {label: 'Quad In Out', value: '0.455, 0.030, 0.515, 0.955'},
  {label: 'Quad In', value: '0.550, 0.085, 0.680, 0.530'},
  {label: 'Quad Out', value: '0.250, 0.460, 0.450, 0.940'},
  {label: 'Quart In Out', value: '0.770, 0, 0.175, 1'},
  {label: 'Quart In', value: '0.895, 0.030, 0.685, 0.220'},
  {label: 'Quart Out', value: '0.165, 0.840, 0.440, 1'},
  {label: 'Quint In Out', value: '0.860, 0, 0.070, 1'},
  {label: 'Quint In', value: '0.755, 0.050, 0.855, 0.060'},
  {label: 'Quint Out', value: '0.230, 1, 0.320, 1'},
  {label: 'Sine In Out', value: '0.445, 0.050, 0.550, 0.950'},
  {label: 'Sine In', value: '0.470, 0, 0.745, 0.715'},
  {label: 'Sine Out', value: '0.390, 0.575, 0.565, 1'},
]

const results = fuzzySort.go('out', presets, {key: 'label', allowTypo: false})
console.log(results)
results.forEach((r) => {
  console.log(fuzzySort.highlight(r))
})

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
      <BasicAutocompleteInput
        autocompleteOptions={presets}
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

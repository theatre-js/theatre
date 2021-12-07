import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useLayoutEffect, useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 230px;
`

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  overflow: auto;
  max-height: 130px;
`

const EasingOption = styled.div<{candidate: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 4px;

  // The candidate preset is going to be applied when enter is pressed
  box-shadow: 0 0 0 2px
    ${(props) => (props.candidate ? 'rgba(255,255,255,0.4)' : 'transparent')};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  b {
    text-decoration: underline;
    // Default underline is too close to the text to be subtle
    text-underline-offset: 2px;
    text-decoration-color: rgba(255, 255, 255, 0.4);
  }
`

const EasingCurveContainer = styled.div`
  display: flex;
  padding: 6px;
  background: rgba(255, 255, 255, 0.1);
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
  const [filter, setFilter] = useState<string>('')

  const presetResults = useMemo(
    () =>
      fuzzySort.go(filter, presets, {
        key: 'label',
        allowTypo: false,
      }),
    [filter],
  )

  const fns = useMemo(() => {
    let tempTransaction: CommitOrDiscard | undefined

    return {
      temporarilySetValue(newCurve: string, applyFilter = true): void {
        if (applyFilter) {
          setFilter(newCurve)
        }

        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }

        const args = cssCubicBezierArgsToHandles(newCurve)!
        if (!args) {
          return
        }

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
        const args =
          cssCubicBezierArgsToHandles(newCurve) ??
          cssCubicBezierArgsToHandles(presetResults[0].obj.value)

        if (!args) {
          return
        }

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

        props.onRequestClose()
      },
    }
  }, [props.layoutP, props.index, presetResults])

  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    inputRef.current!.focus()
    inputRef.current!.setSelectionRange(0, 100)
  }, [])

  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const cssCubicBezierString = keyframesToCssCubicBezierArgs(cur, next)

  // Need some padding *inside* the SVG so that the handles and overshoots are not clipped
  const svgPadding = 0.12
  const svgCircleRadius = 0.08
  const svgColor = '#b98b08'

  // query
  const useQuery = /^[A-Za-z]/.test(filter)
  const optionsEmpty = useQuery && presetResults.length === 0

  return (
    <Container>
      <InputContainer>
        <BasicAutocompleteInput
          value={cssCubicBezierString}
          {...fns}
          inputRef={inputRef}
          onBlur={() => props.onRequestClose()}
        />
      </InputContainer>
      {!optionsEmpty && (
        <OptionsContainer
          // Don't wanna lose focus on a misclick
          onPointerDown={(e) => {
            e.preventDefault()
          }}
        >
          {(useQuery ? presetResults : presets).map((result) => {
            const preset = ((result as any).obj ?? result) as typeof presets[0]

            const easing = preset.value.split(', ').map((e) => Number(e))

            return (
              <EasingOption
                key={preset.label}
                onClick={() => {
                  fns.permenantlySetValue(preset.value)
                  props.onRequestClose()
                }}
                // Temporarily apply on hover
                onMouseOver={() => {
                  // When previewing with hover, we don't want to set the filter too
                  fns.temporarilySetValue(preset.value, false)
                }}
                onMouseOut={() => {
                  fns.discardTemporaryValue()
                }}
                candidate={useQuery && result === presetResults[0]}
              >
                <EasingCurveContainer>
                  <svg
                    width="18"
                    height="18"
                    viewBox={`0 0 ${1 + svgPadding * 2} ${1 + svgPadding * 2}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d={`M${svgPadding} ${1 + svgPadding} C${
                        easing[0] + svgPadding
                      } ${1 - easing[1] + svgPadding} ${
                        easing[2] + svgPadding
                      } ${1 - easing[3] + svgPadding} ${
                        1 + svgPadding
                      } ${svgPadding}`}
                      stroke={svgColor}
                      strokeWidth="0.08"
                    />
                    <circle
                      cx={svgPadding}
                      cy={1 + svgPadding}
                      r={svgCircleRadius}
                      fill={svgColor}
                    />
                    <circle
                      cx={1 + svgPadding}
                      cy={svgPadding}
                      r={svgCircleRadius}
                      fill={svgColor}
                    />
                  </svg>
                </EasingCurveContainer>
                <span>
                  {useQuery ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: fuzzySort.highlight(result as any)!,
                      }}
                    />
                  ) : (
                    preset.label
                  )}
                </span>
              </EasingOption>
            )
          })}
        </OptionsContainer>
      )}
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

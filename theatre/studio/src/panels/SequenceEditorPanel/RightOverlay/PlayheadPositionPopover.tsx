import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism} from '@theatre/react'
import type {BasicNumberInputNudgeFn} from '@theatre/studio/uiComponents/form/BasicNumberInput'
import BasicNumberInput from '@theatre/studio/uiComponents/form/BasicNumberInput'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'
import {useLayoutEffect, useMemo, useRef} from 'react'
import React from 'react'
import {val} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import clamp from 'lodash-es/clamp'

const greaterThanZero = (v: number) => isFinite(v) && v > 0

const Container = styled.div`
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  height: 28px;
  align-items: center;
`

const Label = styled.div`
  ${propNameTextCSS};
  white-space: nowrap;
`

const nudge: BasicNumberInputNudgeFn = ({deltaX}) => deltaX * 0.25

const PlayheadPositionPopover: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  /**
   * Called when user hits enter/escape
   */
  onRequestClose: (reason: string) => void
}> = ({layoutP, onRequestClose}) => {
  const sheet = val(layoutP.sheet)
  const sequence = sheet.getSequence()

  const fns = useMemo(() => {
    let tempPosition: number | undefined
    const originalPosition = sequence.position

    return {
      temporarilySetValue(newPosition: number): void {
        if (tempPosition) {
          tempPosition = undefined
        }
        tempPosition = clamp(newPosition, 0, sequence.length)
        sequence.position = tempPosition
      },
      discardTemporaryValue(): void {
        if (tempPosition) {
          tempPosition = undefined
          sequence.position = originalPosition
        }
      },
      permanentlySetValue(newPosition: number): void {
        if (tempPosition) {
          tempPosition = undefined
        }
        sequence.position = clamp(newPosition, 0, sequence.length)
      },
    }
  }, [layoutP, sequence])

  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    inputRef.current!.focus()
  }, [])

  return usePrism(() => {
    const sequence = sheet.getSequence()

    return (
      <Container>
        <Label>Sequence position</Label>
        <BasicNumberInput
          value={Number(sequence.position.toFixed(3))}
          {...fns}
          isValid={greaterThanZero}
          inputRef={inputRef}
          onBlur={onRequestClose.bind(null, 'number input blur')}
          nudge={nudge}
        />
      </Container>
    )
  }, [sheet, fns, inputRef])
}

export default PlayheadPositionPopover

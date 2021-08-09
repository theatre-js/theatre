import type {Pointer} from '@theatre/dataverse'
import React, {useLayoutEffect, useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism, useVal} from '@theatre/dataverse-react'
import getStudio from '@theatre/studio/getStudio'
import BasicNumberInput from '@theatre/studio/uiComponents/form/BasicNumberInput'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {propNameText} from '@theatre/studio/panels/DetailPanel/propEditors/utils/SingleRowPropEditor'

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

const LengthEditorPopover: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  /**
   * Called when user hits enter/escape
   */
  onRequestClose: () => void
}> = ({layoutP, onRequestClose}) => {
  const sheet = useVal(layoutP.sheet)

  const fns = useMemo(() => {
    let tempTransaction: CommitOrDiscard | undefined

    return {
      temporarilySetValue(newLength: number): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
            ...sheet.address,
            length: newLength,
          })
        })
      },
      discardTemporaryValue(): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
      },
      permenantlySetValue(newLength: number): void {
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        getStudio()!.transaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
            ...sheet.address,
            length: newLength,
          })
        })
      },
    }
  }, [layoutP, sheet])

  const inputRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    inputRef.current!.focus()
  }, [])

  return usePrism(() => {
    const sequence = sheet.getSequence()
    const sequenceLength = sequence.length

    return (
      <Container>
        <Label>Sequence length</Label>
        <BasicNumberInput
          value={sequenceLength}
          {...fns}
          isValid={greaterThanZero}
          inputRef={inputRef}
          onBlur={onRequestClose}
        />
      </Container>
    )
  }, [sheet, fns, inputRef])
}

export default LengthEditorPopover

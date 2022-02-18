import type {Pointer} from '@theatre/dataverse'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {usePrism, useVal} from '@theatre/react'
import getStudio from '@theatre/studio/getStudio'
import type {BasicNumberInputNudgeFn} from '@theatre/studio/uiComponents/form/BasicNumberInput'
import BasicNumberInput from '@theatre/studio/uiComponents/form/BasicNumberInput'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import {propNameText} from '@theatre/studio/panels/DetailPanel/propEditors/utils/SingleRowPropEditor'

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

const nudge: BasicNumberInputNudgeFn = ({deltaX}) => deltaX * 0.1

const LengthEditorPopover: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  /**
   * Called when user hits enter/escape
   */
  onRequestClose: () => void
  range: [min: number, max: number]
}> = ({layoutP, onRequestClose, range}) => {
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
            length: newLength, // TODO: set min here or in BasicNumberInput?
          })
        })
      },
    }
  }, [sheet])

  return usePrism(() => {
    const sequence = sheet.getSequence()
    const sequenceLength = sequence.length

    return (
      <Container>
        <Label>Sequence length</Label>
        <BasicNumberInput
          {...fns}
          value={sequenceLength}
          onBlur={onRequestClose}
          nudge={nudge}
          range={range}
          defaultMode="editingViaKeyboard"
        />
      </Container>
    )
  }, [sheet, fns])
}

export default LengthEditorPopover

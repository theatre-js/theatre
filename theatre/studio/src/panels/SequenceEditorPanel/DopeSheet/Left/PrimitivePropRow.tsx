import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import getStudio from '@theatre/studio/getStudio'
import {encodePathToProp} from '@theatre/shared/utils/addresses'
import pointerDeep from '@theatre/shared/utils/pointerDeep'
import {usePrism} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useCallback, useRef} from 'react'
import styled from 'styled-components'
import {useEditingToolsForSimplePropInDetailsPanel} from '@theatre/studio/propEditors/useEditingToolsForSimpleProp'
import {nextPrevCursorsTheme} from '@theatre/studio/propEditors/NextPrevKeyframeCursors'
import {graphEditorColors} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import {BaseHeader, Container as BaseContainer} from './AnyCompositeRow'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'

const theme = {
  label: {
    color: `#9a9a9a`,
  },
}

const Container = styled(BaseContainer)<{}>``

const Head = styled(BaseHeader)<{
  isSelected: boolean
  isEven: boolean
}>`
  display: flex;
  color: ${theme.label.color};
  padding-right: 12px;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
`

const IconContainer = styled.button<{
  isSelected: boolean
  graphEditorColor: keyof typeof graphEditorColors
}>`
  background: none;
  border: none;
  outline: none;
  display: flex;
  box-sizing: border-box;
  font-size: 14px;
  align-items: center;
  height: 100%;
  margin-left: 12px;
  color: ${(props) =>
    props.isSelected
      ? graphEditorColors[props.graphEditorColor].iconColor
      : nextPrevCursorsTheme.offColor};

  &:not([disabled]):hover {
    color: white;
  }
`

const GraphIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="10"
    height="12"
    viewBox="0 0 640 512"
  >
    <g transform="translate(0 100)">
      <path
        fill="currentColor"
        d="M368 32h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32V64c0-17.67-14.33-32-32-32zM208 88h-84.75C113.75 64.56 90.84 48 64 48 28.66 48 0 76.65 0 112s28.66 64 64 64c26.84 0 49.75-16.56 59.25-40h79.73c-55.37 32.52-95.86 87.32-109.54 152h49.4c11.3-41.61 36.77-77.21 71.04-101.56-3.7-8.08-5.88-16.99-5.88-26.44V88zm-48 232H64c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32zM576 48c-26.84 0-49.75 16.56-59.25 40H432v72c0 9.45-2.19 18.36-5.88 26.44 34.27 24.35 59.74 59.95 71.04 101.56h49.4c-13.68-64.68-54.17-119.48-109.54-152h79.73c9.5 23.44 32.41 40 59.25 40 35.34 0 64-28.65 64-64s-28.66-64-64-64zm0 272h-96c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h96c17.67 0 32-14.33 32-32v-96c0-17.67-14.33-32-32-32z"
      />
    </g>
  </svg>
)

const Head_Label = styled.span`
  margin-right: 4px;
  ${propNameTextCSS};
`

const PrimitivePropRow: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
}> = ({leaf}) => {
  const pointerToProp = pointerDeep(
    leaf.sheetObject.propsP,
    leaf.pathToProp,
  ) as Pointer<$IntentionalAny>

  const obj = leaf.sheetObject
  const {controlIndicators} = useEditingToolsForSimplePropInDetailsPanel(
    pointerToProp,
    obj,
    leaf.propConf,
  )

  const possibleColor = usePrism(() => {
    const c = leaf.sheetObject.address
    const encodedPathToProp = encodePathToProp(leaf.pathToProp)
    return val(
      getStudio()!.atomP.historic.projects.stateByProjectId[c.projectId]
        .stateBySheetId[c.sheetId].sequenceEditor.selectedPropsByObject[
        c.objectKey
      ][encodedPathToProp],
    )
  }, [leaf])

  const isSelectedRef = useRef<boolean>(false)
  const isSelected = typeof possibleColor === 'string'
  isSelectedRef.current = isSelected

  const toggleSelect = useCallback(() => {
    const c = leaf.sheetObject.address
    getStudio()!.transaction(({stateEditors}) => {
      if (isSelectedRef.current) {
        stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.removePropFromGraphEditor(
          {...c, pathToProp: leaf.pathToProp},
        )
      } else {
        stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.addPropToGraphEditor(
          {...c, pathToProp: leaf.pathToProp},
        )
        stateEditors.studio.historic.panels.sequenceEditor.graphEditor.setIsOpen(
          {
            isOpen: true,
          },
        )
      }
    })
  }, [leaf])

  const label = leaf.pathToProp[leaf.pathToProp.length - 1]
  const isSelectable = true

  return (
    <Container depth={leaf.depth}>
      <Head
        isEven={leaf.n % 2 === 0}
        style={{
          height: leaf.nodeHeight + 'px',
        }}
        isSelected={isSelected === true}
      >
        <Head_Label>{label}</Head_Label>
        {controlIndicators}
        <IconContainer
          onClick={toggleSelect}
          isSelected={isSelected === true}
          graphEditorColor={possibleColor ?? '1'}
          style={{opacity: isSelectable ? 1 : 0.25}}
          disabled={!isSelectable}
        >
          <GraphIcon />
        </IconContainer>
      </Head>
    </Container>
  )
}

export default PrimitivePropRow

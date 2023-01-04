import type {
  PropTypeConfig_Compound,
  PropTypeConfig_Number,
} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'
import type {$FixMe} from '@theatre/shared/utils/types'
import {Atom, getPointerParts} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import last from 'lodash-es/last'
import {darken, transparentize} from 'polished'
import React, {useLayoutEffect, useMemo} from 'react'
import styled from 'styled-components'
import {rowIndentationFormulaCSS} from '@theatre/studio/panels/DetailPanel/DeterminePropEditorForDetail/rowIndentationFormulaCSS'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import DeterminePropEditorForDetail from '@theatre/studio/panels/DetailPanel/DeterminePropEditorForDetail'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {useEditingToolsForCompoundProp} from '@theatre/studio/propEditors/useEditingToolsForCompoundProp'
import type {PropHighlighted} from '@theatre/studio/panels/SequenceEditorPanel/whatPropIsHighlighted'
import {whatPropIsHighlighted} from '@theatre/studio/panels/SequenceEditorPanel/whatPropIsHighlighted'
import {deriver} from '@theatre/studio/utils/derive-utils'
import {getDetailRowHighlightBackground} from './getDetailRowHighlightBackground'
import NumberPropEditor from '@theatre/studio/propEditors/simpleEditors/NumberPropEditor'
import type {IDetailSimplePropEditorProps} from './DetailSimplePropEditor'
import {useEditingToolsForSimplePropInDetailsPanel} from '@theatre/studio/propEditors/useEditingToolsForSimpleProp'
import {EllipsisFill} from '@theatre/studio/uiComponents/icons'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'

const Container = styled.div`
  --step: 15px;
  --left-pad: 15px;
  ${pointerEventsAutoInNormalMode};
  --right-width: 60%;
`

const Header = deriver(styled.div<{isHighlighted: PropHighlighted}>`
  height: 30px;
  display: flex;
  align-items: stretch;
  position: relative;

  /* background-color: ${getDetailRowHighlightBackground}; */
`)

const Padding = styled.div`
  padding-left: ${rowIndentationFormulaCSS};
  display: flex;
  align-items: center;
  width: calc(100% - var(--right-width));
`

const PropName = deriver(styled.div<{isHighlighted: PropHighlighted}>`
  margin-left: 4px;
  cursor: default;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
  &:hover {
    color: white;
  }

  ${() => propNameTextCSS};
`)

const color = transparentize(0.05, `#282b2f`)

const SubProps = styled.div<{depth: number; lastSubIsComposite: boolean}>`
  /* background: ${({depth}) => darken(depth * 0.03, color)}; */
  /* padding: ${(props) => (props.lastSubIsComposite ? 0 : '4px')} 0; */
`

const isVectorProp = (propConfig: PropTypeConfig_Compound<any>) => {
  const props = Object.entries(propConfig.props)

  return (
    props.length <= 3 &&
    props.every(
      ([name, conf]) =>
        conf.type === 'number' && ['x', 'y', 'z'].includes(name),
    )
  )
}

function VectorComponentEditor<TPropTypeConfig extends PropTypeConfig_Number>({
  propConfig,
  pointerToProp,
  obj,
  SimpleEditorComponent: EditorComponent,
}: IDetailSimplePropEditorProps<TPropTypeConfig>) {
  const editingTools = useEditingToolsForSimplePropInDetailsPanel(
    pointerToProp,
    obj,
    propConfig,
  )

  return (
    <NumberPropEditor
      editingTools={editingTools}
      propConfig={propConfig}
      value={editingTools.value}
    />
  )
}

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
  padding: 0 8px 0 2px;
  box-sizing: border-box;
  height: 100%;
  width: var(--right-width);
  flex-shrink: 0;
  flex-grow: 0;
`

export type ICompoundPropDetailEditorProps<
  TPropTypeConfig extends PropTypeConfig_Compound<any>,
> = {
  propConfig: TPropTypeConfig
  pointerToProp: Pointer<TPropTypeConfig['valueType']>
  obj: SheetObject
  visualIndentation: number
}

function DetailCompoundPropEditor<
  TPropTypeConfig extends PropTypeConfig_Compound<any>,
>({
  pointerToProp,
  obj,
  propConfig,
  visualIndentation,
}: ICompoundPropDetailEditorProps<TPropTypeConfig>) {
  const propName = propConfig.label ?? last(getPointerParts(pointerToProp).path)

  const allSubs = Object.entries(propConfig.props)
  const compositeSubs = allSubs.filter(([_, conf]) =>
    isPropConfigComposite(conf),
  )
  const nonCompositeSubs = allSubs.filter(
    ([_, conf]) => !isPropConfigComposite(conf),
  )

  const [propNameContainerRef, propNameContainer] =
    useRefAndState<HTMLDivElement | null>(null)

  const tools = useEditingToolsForCompoundProp(
    pointerToProp as $FixMe,
    obj,
    propConfig,
  )

  const [contextMenu] = useContextMenu(propNameContainer, {
    menuItems: tools.contextMenuItems,
  })

  const lastSubPropIsComposite = compositeSubs.length > 0

  const isPropHighlightedD = useMemo(
    () =>
      whatPropIsHighlighted.getIsPropHighlightedD({
        ...obj.address,
        pathToProp: getPointerParts(pointerToProp).path,
      }),
    [pointerToProp],
  )

  const globalPointerPath = `${obj.address.projectId},${obj.address.sheetId},${
    obj.address.sheetInstanceId
  },${obj.address.objectKey},${getPointerParts(pointerToProp).path.join()}`

  useLayoutEffect(() => {
    if (!collapsedMap.has(globalPointerPath)) {
      collapsedMap.set(globalPointerPath, new Atom(isVectorProp(propConfig)))
    }
  }, [])

  const box = collapsedMap.get(globalPointerPath)

  const isCollapsed = usePrism(() => {
    const box = collapsedMap.get(globalPointerPath)

    return box ? val(box.pointer) : isVectorProp(propConfig)
  }, [box])

  return (
    <Container>
      {contextMenu}
      <Header
        isHighlighted={isPropHighlightedD}
        // @ts-ignore
        style={{'--depth': visualIndentation - 1}}
      >
        <Padding>
          {tools.controlIndicators}
          <PropName
            isHighlighted={isPropHighlightedD}
            ref={propNameContainerRef}
            onClick={() => {
              box?.set(!box.get())
            }}
          >
            <span>{propName || 'Props'}</span>
            {!isVectorProp(propConfig) && isCollapsed && (
              <EllipsisFill
                width={24}
                height={24}
                style={{
                  transform: 'translateY(2px)',
                }}
              />
            )}
          </PropName>
        </Padding>
        {isVectorProp(propConfig) && isCollapsed && (
          <InputContainer>
            {[...allSubs].map(([subPropKey, subPropConfig]) => {
              return (
                <VectorComponentEditor
                  key={'prop-' + subPropKey}
                  // @ts-ignore
                  propConfig={subPropConfig}
                  pointerToProp={pointerToProp[subPropKey] as Pointer<$FixMe>}
                  obj={obj}
                />
              )
            })}
          </InputContainer>
        )}
      </Header>

      {!isCollapsed && (
        <SubProps
          // @ts-ignore
          style={{'--depth': visualIndentation}}
          depth={visualIndentation}
          lastSubIsComposite={lastSubPropIsComposite}
        >
          {[...nonCompositeSubs, ...compositeSubs].map(
            ([subPropKey, subPropConfig]) => {
              return (
                <DeterminePropEditorForDetail
                  key={'prop-' + subPropKey}
                  propConfig={subPropConfig}
                  pointerToProp={pointerToProp[subPropKey] as Pointer<$FixMe>}
                  obj={obj}
                  visualIndentation={visualIndentation + 1}
                />
              )
            },
          )}
        </SubProps>
      )}
    </Container>
  )
}

export default React.memo(DetailCompoundPropEditor)

const collapsedMap = new Map<string, Atom<boolean>>()

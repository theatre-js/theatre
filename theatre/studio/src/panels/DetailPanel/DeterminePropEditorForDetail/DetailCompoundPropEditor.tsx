import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'
import {getPointerParts} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import last from 'lodash-es/last'
import {darken, transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'
import {
  indentationFormula,
  rowBg,
} from '@theatre/studio/panels/DetailPanel/DeterminePropEditorForDetail/SingleRowPropEditor'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'
import DefaultOrStaticValueIndicator from '@theatre/studio/propEditors/DefaultValueIndicator'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import DeterminePropEditorForDetail from '@theatre/studio/panels/DetailPanel/DeterminePropEditorForDetail'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {$FixMe} from '@theatre/shared/utils/types'

const Container = styled.div`
  --step: 8px;
  --left-pad: 0px;
  ${pointerEventsAutoInNormalMode};
`

const Header = styled.div`
  height: 30px;
  display: flex;
  align-items: stretch;
  position: relative;

  ${rowBg};
`

const Padding = styled.div`
  padding-left: ${indentationFormula};
  display: flex;
  align-items: center;
`

const PropName = styled.div`
  margin-left: 4px;
  cursor: default;
  height: 100%;
  display: flex;
  align-items: center;
  user-select: none;
  &:hover {
    /* color: white; */
  }

  ${() => propNameTextCSS};
`

const color = transparentize(0.05, `#282b2f`)

const SubProps = styled.div<{depth: number; lastSubIsComposite: boolean}>`
  /* background: ${({depth}) => darken(depth * 0.03, color)}; */
  /* padding: ${(props) => (props.lastSubIsComposite ? 0 : '4px')} 0; */
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

  const lastSubPropIsComposite = compositeSubs.length > 0

  // previous versions of the DetailCompoundPropEditor had a context menu item for "Reset values".

  return (
    <Container>
      <Header
        // @ts-ignore
        style={{'--depth': visualIndentation - 1}}
      >
        <Padding>
          <DefaultOrStaticValueIndicator hasStaticOverride={false} />
          <PropName ref={propNameContainerRef}>{propName || 'Props'}</PropName>
        </Padding>
      </Header>

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
    </Container>
  )
}

export default DetailCompoundPropEditor

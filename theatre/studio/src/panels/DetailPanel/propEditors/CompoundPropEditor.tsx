import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {getPointerParts} from '@theatre/dataverse'
import last from 'lodash-es/last'
import {darken, transparentize} from 'polished'
import React from 'react'
import styled from 'styled-components'
import DeterminePropEditor from './DeterminePropEditor'
import {
  indentationFormula,
  propNameText,
  rowBg,
} from './utils/SingleRowPropEditor'
import DefaultOrStaticValueIndicator from './utils/DefaultValueIndicator'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {IPropEditorFC} from './utils/IPropEditorFC'

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

  ${() => propNameText};
`

const color = transparentize(0.05, `#282b2f`)

const SubProps = styled.div<{depth: number; lastSubIsComposite: boolean}>`
  /* background: ${({depth}) => darken(depth * 0.03, color)}; */
  /* padding: ${(props) => (props.lastSubIsComposite ? 0 : '4px')} 0; */
`

const CompoundPropEditor: IPropEditorFC<
  PropTypeConfig_Compound<$IntentionalAny>
> = ({pointerToProp, obj, propConfig, visualIndentation: depth}) => {
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

  // const [contextMenu] = useContextMenu(propNameContainer, {
  //   items: () => {
  //     const items: IContextMenuItem[] = []

  //     const pathToProp = getPointerParts(pointerToProp).path

  //     const validSequencedTracks = val(
  //       obj.template.getMapOfValidSequenceTracks_forStudio(),
  //     )
  //     const possibleSequenceTrackIds = getDeep(validSequencedTracks, pathToProp)

  //     const hasSequencedTracks = !!(
  //       typeof possibleSequenceTrackIds === 'object' &&
  //       possibleSequenceTrackIds &&
  //       Object.keys(possibleSequenceTrackIds).length > 0
  //     )

  //     if (hasSequencedTracks) {
  //       items.push({
  //         label: 'Make All Static',
  //         enabled: hasSequencedTracks,
  //         callback: () => {
  //           getStudio()!.transaction(({stateEditors}) => {
  //             const propAddress = {...obj.address, pathToProp}

  //             stateEditors.coreByProject.historic.sheetsById.sequence.setCompoundPropAsStatic(
  //               {
  //                 ...propAddress,
  //                 value: obj.getValueByPointer(
  //                   pointerToProp,
  //                 ) as unknown as SerializableMap,
  //               },
  //             )
  //           })
  //         },
  //       })
  //     }

  //     items.push({
  //       label: 'Reset all',
  //       callback: () => {
  //         getStudio()!.transaction(({unset}) => {
  //           unset(pointerToProp)
  //         })
  //       },
  //     })
  //     return items
  //   },
  // })

  const lastSubPropIsComposite = compositeSubs.length > 0

  return (
    <Container>
      {/* {contextMenu} */}
      <Header
        // @ts-ignore
        style={{'--depth': depth - 1}}
      >
        <Padding>
          <DefaultOrStaticValueIndicator hasStaticOverride={false} />
          <PropName ref={propNameContainerRef}>{propName || 'Props'}</PropName>
        </Padding>
      </Header>

      <SubProps
        // @ts-ignore
        style={{'--depth': depth}}
        depth={depth}
        lastSubIsComposite={lastSubPropIsComposite}
      >
        {[...nonCompositeSubs, ...compositeSubs].map(
          ([subPropKey, subPropConfig]) => {
            return (
              <DeterminePropEditor
                key={'prop-' + subPropKey}
                propConfig={subPropConfig}
                pointerToProp={pointerToProp[subPropKey]}
                obj={obj}
                visualIndentation={depth + 1}
              />
            )
          },
        )}
      </SubProps>
    </Container>
  )
}

export default CompoundPropEditor

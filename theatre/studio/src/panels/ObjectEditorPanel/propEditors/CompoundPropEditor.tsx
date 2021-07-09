import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {theme} from '@theatre/studio/css'
import {voidFn} from '@theatre/shared/utils'
import {usePrism} from '@theatre/dataverse-react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {getPointerParts} from '@theatre/dataverse'
import last from 'lodash-es/last'
import {darken} from 'polished'
import React from 'react'
import {HiOutlineChevronRight} from 'react-icons/all'
import styled from 'styled-components'
import DeterminePropEditor from './DeterminePropEditor'
import NextPrevKeyframeCursors from './utils/NextPrevKeyframeCursors'
import {propNameText} from './utils/SingleRowPropEditor'

const Container = styled.div<{depth: number}>`
  --depth: ${(props) => props.depth};
`

const Header = styled.div`
  height: 30px;
  padding-left: calc(-8px + var(--depth) * 20px);
  display: flex;
  align-items: center;
  color: ${theme.panel.body.compoudThing.label.color};
`

const IconContainer = styled.div`
  width: 12px;
  margin-right: 6px;
  font-size: 9px;
  text-align: center;
  transform: rotateZ(90deg);
`

const PropName = styled.div`
  margin-right: 4px;
  cursor: default;
  ${propNameText}
`

const SubProps = styled.div<{depth: number; lastSubIsComposite: boolean}>`
  background: ${({depth}) => darken(depth * 0.03, theme.panel.bg)};
  padding: ${(props) => (props.lastSubIsComposite ? 0 : '4px')} 0;
`

const CompoundPropEditor: React.FC<{
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
  propConfig: PropTypeConfig_Compound<$IntentionalAny>
  depth: number
}> = ({pointerToProp, obj, propConfig, depth}) => {
  const propName = propConfig.label ?? last(getPointerParts(pointerToProp).path)

  const allSubs = Object.entries(propConfig.props)
  const compositeSubs = allSubs.filter(([_, conf]) =>
    isPropConfigComposite(conf),
  )
  const nonCompositeSubs = allSubs.filter(
    ([_, conf]) => !isPropConfigComposite(conf),
  )

  const lastSubPropIsComposite = compositeSubs.length > 0

  return usePrism(() => {
    return (
      <Container depth={depth}>
        {
          <Header>
            <IconContainer>
              <HiOutlineChevronRight />
            </IconContainer>
            <PropName>{propName || 'props'}</PropName>
            <NextPrevKeyframeCursors
              jumpToPosition={voidFn}
              toggleKeyframeOnCurrentPosition={voidFn}
            />
          </Header>
        }

        <SubProps depth={depth} lastSubIsComposite={lastSubPropIsComposite}>
          {[...nonCompositeSubs, ...compositeSubs].map(
            ([subPropKey, subPropConfig]) => {
              return (
                <DeterminePropEditor
                  key={'prop-' + subPropKey}
                  propConfig={subPropConfig}
                  pointerToProp={pointerToProp[subPropKey]}
                  obj={obj}
                  depth={depth + 1}
                />
              )
            },
          )}
        </SubProps>
      </Container>
    )
  }, [pointerToProp, obj])
}

export default CompoundPropEditor

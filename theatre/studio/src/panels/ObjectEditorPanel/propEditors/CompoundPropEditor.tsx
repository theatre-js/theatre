import type {PropTypeConfig_Compound} from '@theatre/core/propTypes'
import {isPropConfigComposite} from '@theatre/shared/propTypes/utils'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {theme} from '@theatre/studio/css'
import {usePrism} from '@theatre/dataverse-react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {getPointerParts} from '@theatre/dataverse'
import last from 'lodash-es/last'
import {darken, transparentize} from 'polished'
import React from 'react'
import styled, {css} from 'styled-components'
import DeterminePropEditor from './DeterminePropEditor'
import {propNameText} from './utils/SingleRowPropEditor'
import DefaultOrStaticValueIndicator from './utils/DefaultValueIndicator'

const Container = styled.div`
  --step: 8px;
  --left-pad: 18px;
`

export const rowBg = css`
  &:after {
    position: absolute;
    display: block;
    inset: 0px 0 1px calc(0px + var(--left-pad) + var(--depth) * var(--step));
    content: ' ';
    z-index: -1;
    background-color: #282b2f;
    opacity: 0.95;
  }
`

const Header = styled.div`
  height: 30px;
  /* padding-left: calc(var(--left-pad) + var(--depth) * var(--step)); */
  display: flex;
  align-items: stretch;
  /* color: ${theme.panel.body.compoudThing.label.color}; */
  position: relative;

  ${rowBg};
`

export const indentationFormula = `calc(var(--left-pad) + var(--depth) * var(--step))`

const Padding = styled.div`
  padding-left: ${indentationFormula};
  display: flex;
  align-items: center;
`

const IconContainer = styled.div`
  width: 12px;
  margin-right: -12px;
  /* margin-left: ${indentationFormula}; */
  font-size: 9px;
  text-align: center;
  transform: rotateZ(90deg);
  position: relative;
  left: -18px;
`

const PropName = styled.div`
  margin-left: 4px;
  cursor: default;
  height: 100%;
  display: flex;
  align-items: center;
  ${() => propNameText};
`

const color = transparentize(0.05, `#282b2f`)

const SubProps = styled.div<{depth: number; lastSubIsComposite: boolean}>`
  /* background: ${({depth}) => darken(depth * 0.03, color)}; */
  /* padding: ${(props) => (props.lastSubIsComposite ? 0 : '4px')} 0; */
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
      <Container>
        {
          <Header
            // @ts-ignore
            style={{'--depth': depth - 1}}
          >
            <Padding>
              {/* <IconContainer>
                <HiOutlineChevronRight />
              </IconContainer> */}
              {/* <NextPrevKeyframeCursors
              jumpToPosition={voidFn}
              toggleKeyframeOnCurrentPosition={voidFn}
            /> */}
              <DefaultOrStaticValueIndicator hasStaticOverride={false} />
              <PropName>{propName || 'Props'}</PropName>
            </Padding>
          </Header>
        }

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

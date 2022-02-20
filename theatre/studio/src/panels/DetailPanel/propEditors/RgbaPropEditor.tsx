import type {PropTypeConfig_Rgba} from '@theatre/core/propTypes'
import type {Rgba} from '@theatre/shared/utils/color'
import {
  decorateRgba,
  rgba2hex,
  parseRgbaFromHex,
} from '@theatre/shared/utils/color'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback, useRef} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import {RgbaColorPicker} from '@theatre/studio/uiComponents/colorPicker'
import styled from 'styled-components'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
`

interface PuckProps {
  background: Rgba
}

const Puck = styled.div.attrs<PuckProps>((props) => ({
  style: {
    background: props.background,
  },
}))<PuckProps>`
  height: calc(100% - 4px);
  aspect-ratio: 1;
  border-radius: 2px;
`

const HexInput = styled(BasicStringInput)`
  flex: 1;
`

const noop = () => {}

const RgbaPropEditor: React.FC<{
  propConfig: PropTypeConfig_Rgba
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const containerRef = useRef<HTMLDivElement>(null!)

  const stuff = useEditingToolsForPrimitiveProp<Rgba>(
    pointerToProp,
    obj,
    propConfig,
  )

  const onChange = useCallback(
    (color: string) => {
      const rgba = decorateRgba(parseRgbaFromHex(color))
      stuff.permenantlySetValue(rgba)
    },
    [stuff],
  )

  const [popoverNode, openPopover] = usePopover({}, () => {
    return (
      <BasicPopover>
        <div
          style={{
            margin: 8,
            pointerEvents: 'all',
          }}
        >
          <RgbaColorPicker
            color={{
              r: stuff.value.r,
              g: stuff.value.g,
              b: stuff.value.b,
              a: stuff.value.a,
            }}
            temporarilySetValue={(color) => {
              const rgba = decorateRgba(color)
              stuff.temporarilySetValue(rgba)
            }}
            permanentlySetValue={(color) => {
              // console.log('perm')
              const rgba = decorateRgba(color)
              stuff.permenantlySetValue(rgba)
            }}
            discardTemporaryValue={stuff.discardTemporaryValue}
          />
        </div>
      </BasicPopover>
    )
  })

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <RowContainer>
        <Puck
          background={stuff.value}
          ref={containerRef}
          onClick={(e) => {
            openPopover(e, containerRef.current)
          }}
        />
        <HexInput
          value={rgba2hex(stuff.value)}
          temporarilySetValue={noop}
          discardTemporaryValue={noop}
          permenantlySetValue={onChange}
          isValid={(v) => !!v.match(/^#?([0-9a-f]{8})$/i)}
        />
      </RowContainer>
      {popoverNode}
    </SingleRowPropEditor>
  )
}

export default RgbaPropEditor

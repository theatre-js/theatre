import type {PropTypeConfig_Rgba} from '@theatre/core/propTypes'
import type {Rgba} from '@theatre/shared/utils/color'
import {validHexRegExp} from '@theatre/shared/utils/color'
import {
  decorateRgba,
  rgba2hex,
  parseRgbaFromHex,
} from '@theatre/shared/utils/color'
import React, {useCallback, useRef} from 'react'
import {RgbaColorPicker} from '@theatre/studio/uiComponents/colorPicker'
import styled from 'styled-components'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import {popoverBackgroundColor} from '@theatre/studio/uiComponents/Popover/BasicPopover'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
`

interface ColorPreviewPuckProps {
  rgbaColor: Rgba
}

const ColorPreviewPuck = styled.div.attrs<ColorPreviewPuckProps>((props) => ({
  style: {
    // weirdly, rgba2hex is needed to ensure initial render was correct background?
    // huge head scratcher.
    background: rgba2hex(props.rgbaColor),
  },
}))<ColorPreviewPuckProps>`
  height: 18px;
  aspect-ratio: 1;
  border-radius: 99999px;
`

const HexInput = styled(BasicStringInput)`
  flex: 1;
`

const noop = () => {}

const RgbaPopover = styled.div`
  position: absolute;
  background-color: ${popoverBackgroundColor};
  color: white;
  margin: 0;
  cursor: default;
  border-radius: 3px;
  z-index: 10000;
  backdrop-filter: blur(8px);

  padding: 4px;
  pointer-events: all;

  border: none;
  box-shadow: none;
`

function RgbaPropEditor({
  editingTools,
  value,
  autoFocus,
}: ISimplePropEditorReactProps<PropTypeConfig_Rgba>) {
  const containerRef = useRef<HTMLDivElement>(null!)

  const onChange = useCallback(
    (color: string) => {
      const rgba = decorateRgba(parseRgbaFromHex(color))
      editingTools.permanentlySetValue(rgba)
    },
    [editingTools],
  )

  const popover = usePopover({debugName: 'RgbaPropEditor'}, () => (
    <RgbaPopover>
      <RgbaColorPicker
        color={{
          r: value.r,
          g: value.g,
          b: value.b,
          a: value.a,
        }}
        temporarilySetValue={(color) => {
          const rgba = decorateRgba(color)
          editingTools.temporarilySetValue(rgba)
        }}
        permanentlySetValue={(color) => {
          const rgba = decorateRgba(color)
          editingTools.permanentlySetValue(rgba)
        }}
        discardTemporaryValue={editingTools.discardTemporaryValue}
      />
    </RgbaPopover>
  ))

  return (
    <>
      <RowContainer>
        <ColorPreviewPuck
          rgbaColor={value}
          ref={containerRef}
          onClick={(e) => {
            popover.toggle(e, containerRef.current)
          }}
        />
        <HexInput
          value={rgba2hex(value, {removeAlphaIfOpaque: true})}
          temporarilySetValue={noop}
          discardTemporaryValue={noop}
          permanentlySetValue={onChange}
          isValid={(v) => !!v.match(validHexRegExp)}
          autoFocus={autoFocus}
        />
      </RowContainer>
      {popover.node}
    </>
  )
}

export default RgbaPropEditor

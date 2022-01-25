import type {PropTypeConfig_Rgba} from '@theatre/core/propTypes'
import type {Rgba} from '@theatre/shared/utils/color'
import {
  decorateRgba,
  rgba2hex,
  parseRgbaFromHex,
} from '@theatre/shared/utils/color'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback, useMemo, useRef} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import {debounce} from 'lodash-es'
import {RgbaColorPicker, HexColorInput} from 'react-colorful'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'

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

  const debouncedPermanentlySetValue = useMemo(
    () =>
      debounce((rgba: Rgba) => {
        stuff.permenantlySetValue(rgba)
      }, 600),
    [],
  )

  const onChange = useCallback(
    (color: string) => {
      const rgba = decorateRgba(parseRgbaFromHex(color))
      stuff.temporarilySetValue(rgba)
      debouncedPermanentlySetValue(rgba)
    },
    [propConfig, pointerToProp, obj],
  )

  const [popoverNode, openPopover] = usePopover({}, () => {
    return (
      <div
        style={{
          pointerEvents: 'all',
        }}
      >
        <RgbaColorPicker
          color={{
            r: stuff.value.r * 255,
            g: stuff.value.g * 255,
            b: stuff.value.b * 255,
            a: stuff.value.a,
          }}
          onChange={(color) => {
            const hex = rgba2hex({
              r: color.r / 255,
              g: color.g / 255,
              b: color.b / 255,
              a: color.a,
            })
            onChange(hex)
          }}
        />
      </div>
    )
  })

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <style>
        {
          '.react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,rgba(255,255,255,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:"";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(to right,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red 100%)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:0;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill-opacity=".05"><rect x="8" width="8" height="8"/><rect y="8" width="8" height="8"/></svg>\')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}'
        }
      </style>
      {/* FIXME: Placeholder UI */}
      <div
        ref={containerRef}
        style={{backgroundColor: rgba2hex(stuff.value), width: 20, height: 20}}
        onClick={(e) => {
          openPopover(e, containerRef.current)
        }}
      />
      <HexColorInput
        color={rgba2hex(stuff.value)}
        onChange={onChange}
        prefixed
        alpha
      />
      {popoverNode}
    </SingleRowPropEditor>
  )
}

export default RgbaPropEditor

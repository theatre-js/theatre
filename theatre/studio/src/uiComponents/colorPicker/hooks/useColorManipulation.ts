import {useState, useEffect, useCallback, useRef} from 'react'
import type {
  ColorModel,
  AnyColor,
  HsvaColor,
} from '@theatre/studio/uiComponents/colorPicker/types'
import {equalColorObjects} from '@theatre/studio/uiComponents/colorPicker/utils/compare'
import {useEventCallback} from './useEventCallback'
import {useEditing} from '@theatre/studio/uiComponents/colorPicker/components/EditingProvider'

export function useColorManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onTemporarilyChange: (color: T) => void,
  onPermanentlyChange: (color: T) => void,
): [HsvaColor, (color: Partial<HsvaColor>) => void] {
  const {editing} = useEditing()
  const [editingValue, setEditingValue] = useState<T>(colorModel.defaultColor)

  // Save onChange callback in the ref for avoiding "useCallback hell"
  const onTemporarilyChangeCallback = useEventCallback<T>(onTemporarilyChange)
  const onPermanentlyChangeCallback = useEventCallback<T>(onPermanentlyChange)

  let value = editing ? editingValue : color

  // No matter which color model is used (HEX, RGB(A) or HSL(A)),
  // all internal calculations are based on HSVA model
  const [hsva, updateHsva] = useState<HsvaColor>(() => colorModel.toHsva(value))

  // By using this ref we're able to prevent extra updates
  // and the effects recursion during the color conversion
  const tempCache = useRef({color: value, hsva})
  const permCache = useRef({color: value, hsva})

  useEffect(() => {
    setEditingValue(tempCache.current.color)
  }, [editing])

  // Update local HSVA-value if `color` property value is changed,
  // but only if that's not the same color that we just sent to the parent
  useEffect(() => {
    if (editing) {
      if (!colorModel.equal(value, tempCache.current.color)) {
        const newHsva = colorModel.toHsva(value)
        tempCache.current = {hsva: newHsva, color: value}
        updateHsva(newHsva)
      }
    }
  }, [editing, value, colorModel])

  // Trigger `onChange` callback only if an updated color is different from cached one;
  // save the new color to the ref to prevent unnecessary updates
  useEffect(() => {
    let newColor = colorModel.fromHsva(hsva)

    if (editing) {
      if (
        !equalColorObjects(hsva, tempCache.current.hsva) &&
        !colorModel.equal(newColor, tempCache.current.color)
      ) {
        tempCache.current = {hsva, color: newColor}

        setEditingValue(newColor)
        onTemporarilyChangeCallback(newColor)
      }
    } else {
      if (
        !equalColorObjects(hsva, permCache.current.hsva) &&
        !colorModel.equal(newColor, permCache.current.color)
      ) {
        tempCache.current = {hsva, color: newColor}

        onPermanentlyChangeCallback(newColor)
      }
    }
  }, [
    editing,
    hsva,
    colorModel,
    onTemporarilyChangeCallback,
    onPermanentlyChangeCallback,
  ])

  useEffect(() => {
    if (!editing) {
      if (!colorModel.equal(value, permCache.current.color)) {
        const newHsva = colorModel.toHsva(value)
        permCache.current = {hsva: newHsva, color: value}
        updateHsva(newHsva)
      }
    }
  }, [editing, value, colorModel])

  // Merge the current HSVA color object with updated params.
  // For example, when a child component sends `h` or `s` only
  const handleChange = useCallback((params: Partial<HsvaColor>) => {
    updateHsva((current) => Object.assign({}, current, params))
  }, [])

  return [hsva, handleChange]
}

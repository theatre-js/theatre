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
  const [editingValue, setEditingValue] = useState<T>(color)

  // Save onChange callbacks in refs for to avoid unnecessarily updating when parent doesn't use useCallback
  const onTemporarilyChangeCallback = useEventCallback<T>(onTemporarilyChange)
  const onPermanentlyChangeCallback = useEventCallback<T>(onPermanentlyChange)

  // If editing, be uncontrolled, if not editing, be controlled
  let value = editing ? editingValue : color

  // No matter which color model is used (HEX, RGB(A) or HSL(A)),
  // all internal calculations are in HSVA
  const [hsva, updateHsva] = useState<HsvaColor>(() => colorModel.toHsva(value))

  // Use refs to prevent infinite update loops. They basically serve as a more
  // explicit hack around the rigidity of React hooks' dep lists, since we want
  // to do all color equality checks in HSVA, without breaking the roles of hooks.
  // We use separate refs for temporary updates and permanent updates,
  // since they are two independent update models.
  const tempCache = useRef({color: value, hsva})
  const permCache = useRef({color: value, hsva})

  // When entering editing mode, set the internal state of the uncontrolled mode
  // to the last value of the controlled mode.
  useEffect(() => {
    if (editing) {
      setEditingValue(tempCache.current.color)
    }
  }, [editing])

  // Trigger `on*Change` callbacks only if an updated color is different from
  // the  cached one; save the new color to the ref to prevent unnecessary updates.
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
        permCache.current = {hsva, color: newColor}
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

  // This has to come after the callback calling effect, so that the cache isn't
  // updated before the above effect checks for equality, otherwise no updates would
  // be issued.
  // Note: it doesn't make sense to have an editing version of this effect because
  // the callback calling effect already updates the caches.
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

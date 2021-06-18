import type {ComponentProps} from 'react'
import React, {forwardRef} from 'react'
import {useFormControlContext} from './FormControl'

export type SliderProps = ComponentProps<'input'>

const Slider = forwardRef<HTMLInputElement, SliderProps>((props, ref) => {
  const id = useFormControlContext()

  return (
    <input
      type="range"
      ref={ref}
      {...props}
      id={props.id ?? id}
      className={`${props.className}`}
    />
  )
})

export default Slider

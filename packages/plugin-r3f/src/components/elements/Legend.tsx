import type {ComponentProps} from 'react'
import React, {forwardRef} from 'react'

export type LegendProps = ComponentProps<'legend'>

const Input = forwardRef<HTMLLegendElement, LegendProps>((props, ref) => {
  return (
    <legend
      ref={ref}
      {...props}
      className={`${props.className} font-medium mb-2`}
    />
  )
})

export default Input

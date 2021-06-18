import type {ComponentProps} from 'react'
import React, {forwardRef} from 'react'

export type HeadingProps = ComponentProps<'h1'>

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => {
  return <h1 ref={ref} {...props} className={`${props.className} font-bold`} />
})

export default Heading

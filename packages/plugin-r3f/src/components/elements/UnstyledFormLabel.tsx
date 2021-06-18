import type {ComponentProps} from 'react'
import React, {forwardRef} from 'react'
import {useFormControlContext} from './FormControl'

export type FormLabelProps = ComponentProps<'label'>

const UnstyledFormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  (props, ref) => {
    const id = useFormControlContext()

    return <label ref={ref} {...props} id={props.id ?? id} />
  },
)

export default UnstyledFormLabel

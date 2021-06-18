import React, {forwardRef} from 'react'
import type {CheckboxProps} from 'reakit'
import {Checkbox as CheckboxImpl} from 'reakit'
import {useFormControlContext} from './FormControl'

export type {CheckboxProps}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({children, ...props}, ref) => {
    const id = useFormControlContext()

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <CheckboxImpl
            // @ts-ignore
            {...props}
            id={props.id ?? id}
            ref={ref}
            className="focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:ring-offset-0 h-4 w-4 text-green-800 border-gray-300 hover:border-gray-400 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={props.id ?? id} className="font-medium text-gray-700">
            {children}
          </label>
        </div>
      </div>
    )
  },
)

export default Checkbox

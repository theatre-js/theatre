import type {ReactElement} from 'react'
import React, {forwardRef} from 'react'
import type {ButtonProps} from 'reakit'
import {Button} from 'reakit'
import type {IconType} from 'react-icons'
import {Tooltip, TooltipReference, useTooltipState} from './index'

export interface IconButtonProps extends Exclude<ButtonProps, 'children'> {
  icon: ReactElement<IconType>
  label: string
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({label, icon, className, ...props}, ref) => {
    const tooltip = useTooltipState()
    return (
      <>
        <TooltipReference
          ref={ref}
          {...props}
          {...tooltip}
          as={Button}
          className={`${className} flex relative items-center justify-center align-middle w-auto text-sm font-semibold h-7 px-2 first:rounded-l last:rounded-r bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-inset`}
          aria-label={label}
        >
          {icon}
        </TooltipReference>
        <Tooltip {...tooltip}>{label}</Tooltip>
      </>
    )
  },
)

export default IconButton

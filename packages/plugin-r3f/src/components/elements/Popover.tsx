import type {VFC} from 'react'
import React from 'react'

import {
  usePopoverState,
  Popover as PopoverImpl,
  PopoverDisclosure,
} from 'reakit'

import type {PopoverProps} from 'reakit'

export type {PopoverProps}

export {PopoverDisclosure, usePopoverState}

export const Popover: VFC<PopoverProps> = ({className, children, ...props}) => {
  return (
    <>
      <PopoverImpl
        // @ts-ignore
        {...props}
        className="flex p-4 w-80 rounded overflow-hidden shadow-2xl focus:outline-none bg-white"
      >
        {/* it seems that rendering Canvas in a display: none element permanently breaks its sizing, so we don't */}
        {props.visible && children}
      </PopoverImpl>
    </>
  )
}

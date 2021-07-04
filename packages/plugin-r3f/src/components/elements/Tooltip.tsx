import type {VFC} from 'react'
import React from 'react'
import {Tooltip as TooltipImpl, TooltipReference, useTooltipState} from 'reakit'

import type {TooltipProps} from 'reakit'

export {TooltipReference, useTooltipState}

export const Tooltip: VFC<TooltipProps> = ({className, ...props}) => (
  <TooltipImpl
    // @ts-ignore
    {...props}
    className={
      `${className} px-2 py-1  text-white bg-gray-700 rounded-sm text-sm pointer-events-none shadow-md` as string
    }
  />
)

import type {ReactElement, ReactNode, VFC} from 'react'
import React from 'react'
import {
  Popover,
  PopoverDisclosure,
  Tooltip,
  TooltipReference,
  usePopoverState,
  useTooltipState,
} from './index'
import {FiChevronDown} from 'react-icons/all'
import type {IconType} from 'react-icons'

export interface SettingsButtonProps {
  icon: ReactElement<IconType>
  label: string
  children: ReactNode
}

const SettingsButton: VFC<SettingsButtonProps> = ({children, icon, label}) => {
  const tooltip = useTooltipState()
  const popover = usePopoverState()

  return (
    <>
      <TooltipReference
        {...tooltip}
        as={'div'}
        tabIndex={-1}
        className="inline-block focus:outline-none"
      >
        <PopoverDisclosure
          // @ts-ignore
          {...popover}
          className={`flex gap-1 relative items-center justify-center align-middle w-auto text-sm font-semibold h-7 px-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-inset`}
        >
          {icon}
          <FiChevronDown />
        </PopoverDisclosure>
      </TooltipReference>
      <Tooltip {...tooltip}>{label}</Tooltip>
      <Popover
        {...popover}
        // this seems to be necessary to prevent the popup from forever being closed after the first opening
        hideOnClickOutside={false}
        aria-label={label}
      >
        {children}
      </Popover>
    </>
  )
}

export default SettingsButton

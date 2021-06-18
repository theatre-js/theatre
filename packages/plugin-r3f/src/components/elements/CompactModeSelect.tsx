import type {ReactElement, ReactNode, VFC} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Group, Button} from 'reakit'
import {
  Tooltip,
  TooltipReference,
  usePopoverState,
  useTooltipState,
  PopoverDisclosure,
  Popover,
} from '.'
import {FiChevronDown} from 'react-icons/all'

interface OptionButtonProps<Option> {
  value: Option
  option: Option
  label: string
  icon: ReactElement<IconType>
  onClick: () => void
}

function OptionButton<Option>({
  value,
  option,
  label,
  icon,
  onClick,
}: OptionButtonProps<Option>) {
  const tooltip = useTooltipState()
  return (
    <>
      <TooltipReference
        {...tooltip}
        as={Button}
        className={`flex relative items-center justify-center align-middle w-auto text-sm font-semibold h-7 px-2 first:rounded-l last:rounded-r focus:outline-none focus:ring focus:ring-blue-300 focus:ring-inset ${
          option === value
            ? 'bg-green-800 hover:bg-green-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </TooltipReference>
      <Tooltip {...tooltip}>{label}</Tooltip>
    </>
  )
}

interface SettingsProps {
  children: ReactNode
}

const Settings: VFC<SettingsProps> = ({children}) => {
  const tooltip = useTooltipState()
  const popover = usePopoverState()

  return (
    <>
      <TooltipReference
        {...tooltip}
        as={'div'}
        tabIndex={-1}
        className="focus:outline-none"
      >
        <PopoverDisclosure
          // @ts-ignore
          {...popover}
          className={`flex relative items-center justify-center align-middle w-auto text-sm font-semibold h-7 px-1 rounded-r bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-inset`}
        >
          <FiChevronDown />
        </PopoverDisclosure>
      </TooltipReference>
      <Tooltip {...tooltip}>Settings</Tooltip>
      <Popover
        {...popover}
        // this seems to be necessary to prevent the popup from forever being closed after the first opening
        hideOnClickOutside={false}
        aria-label="More options"
      >
        {children}
      </Popover>
    </>
  )
}

export interface CompactModeSelectProps<Option> {
  value: Option
  onChange: (value: Option) => void
  options: {
    option: Option
    label: string
    icon: ReactElement<IconType>
  }[]
  settingsPanel?: ReactNode
}

const CompactModeSelect = <Option extends string | number>({
  value,
  onChange,
  options,
  settingsPanel,
}: CompactModeSelectProps<Option>) => {
  return (
    <Group
      // @ts-ignore
      className="flex"
    >
      {options.map(({label, icon, option}) => (
        <OptionButton
          key={option}
          value={value}
          option={option}
          label={label}
          icon={icon}
          onClick={() => onChange(option)}
        />
      ))}
      {settingsPanel && <Settings>{settingsPanel}</Settings>}
    </Group>
  )
}

export default CompactModeSelect

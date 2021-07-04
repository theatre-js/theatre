import type {ReactElement, ReactNode} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Group, Button} from 'reakit'
import {Tooltip, TooltipReference, useTooltipState} from './Tooltip'

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

interface CompactModeSelectProps<Option> {
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
    </Group>
  )
}

export default CompactModeSelect

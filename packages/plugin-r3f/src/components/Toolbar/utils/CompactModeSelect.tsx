import type {ReactElement, ReactNode} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Group, Button} from 'reakit'
import styled from 'styled-components'
import {Tooltip, TooltipReference, useTooltipState} from './Tooltip'

interface OptionButtonProps<Option> {
  value: Option
  option: Option
  label: string
  icon: ReactElement<IconType>
  onClick: () => void
}

const TheButton = styled(TooltipReference)<{selected: boolean}>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  font-size: 11px;
  line-height: 1.25em;
  font-weight: 600;
  height: 24px;
  padding-left: 0.5em;
  padding-right: 0.5em;
  border: 1px solid #22222238;

  border-radius: 2px;

  &:focus {
    outline: none;
  }

  color: #e6e6e5;
  background-color: rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
  }

  &.selected,
  &.selected:hover {
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
  }
`

function OptionButton<Option>({
  value,
  option,
  label,
  icon,
  onClick,
}: OptionButtonProps<Option>) {
  console.log('deprecate CompactModeSelect')

  const tooltip = useTooltipState()
  return (
    <>
      <TheButton
        {...tooltip}
        forwardedAs={Button}
        selected={option === value}
        className={option === value ? 'selected' : undefined}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </TheButton>
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

const Container = styled(Group)`
  display: flex;
  gap: 2px;
`

const CompactModeSelect = <Option extends string | number>({
  value,
  onChange,
  options,
}: CompactModeSelectProps<Option>) => {
  return (
    <Container>
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
    </Container>
  )
}

export default CompactModeSelect

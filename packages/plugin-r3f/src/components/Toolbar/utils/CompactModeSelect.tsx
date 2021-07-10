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

const _TooltipRef = styled(TooltipReference)<{selected: boolean}>`
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  height: 1.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border: 0 transparent;

  &:first-child {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }

  &:last-child {
    border-top-right-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
  }

  &:focus {
    outline: none;
  }

  color: ${({selected}) => (selected ? 'white' : 'rgba(55, 65, 81, 1)')};
  background-color: ${({selected}) =>
    selected ? 'rgba(6, 95, 70, 1)' : 'rgba(243, 244, 246, 1);'};

  &:hover {
    background-color: ${({selected}) =>
      selected ? 'rgba(6, 78, 59, 1)' : 'rgba(229, 231, 235, 1);'};
  }
`

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
      <_TooltipRef
        {...tooltip}
        forwardedAs={Button}
        selected={option === value}
        aria-label={label}
        onClick={onClick}
      >
        {icon}
      </_TooltipRef>
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

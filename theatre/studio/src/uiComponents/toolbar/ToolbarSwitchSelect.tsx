import type {ReactElement} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Group, Button} from 'reakit'
import styled from 'styled-components'
import {TheButton as ButtonImpl} from './ToolbarIconButton'

const Opt = styled(ButtonImpl)``

function OptionButton<T>({
  value,
  label,
  icon,
  onClick,
  isSelected,
}: {
  value: T
  label: string
  icon: ReactElement<IconType>
  onClick: () => void
  isSelected: boolean
}) {
  return (
    <>
      <Opt
        forwardedAs={Button}
        className={isSelected ? 'selected' : undefined}
        aria-label={label}
        onClick={onClick}
        title={label}
      >
        {icon}
      </Opt>
    </>
  )
}

interface Props<Option> {
  value: Option
  onChange: (value: Option) => void
  options: {
    value: Option
    label: string
    icon: ReactElement<IconType>
  }[]
}

const Container = styled(Group)`
  display: flex;
  gap: 5px;
`

const ToolbarSwitchSelect = <Option extends string | number>({
  value: valueOfSwitch,
  onChange,
  options,
}: Props<Option>) => {
  return (
    <Container>
      {options.map(({label, icon, value: optionValue}) => (
        <OptionButton
          key={optionValue}
          value={optionValue}
          isSelected={valueOfSwitch === optionValue}
          label={label}
          icon={icon}
          onClick={() => onChange(optionValue)}
        />
      ))}
    </Container>
  )
}

export default ToolbarSwitchSelect

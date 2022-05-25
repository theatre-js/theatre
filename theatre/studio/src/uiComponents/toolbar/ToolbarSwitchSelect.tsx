import type {ReactElement} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Button} from 'reakit'
import ButtonImpl from './ToolbarIconButton'
import Container from './ToolbarSwitchSelectContainer'

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
      <ButtonImpl
        forwardedAs={Button}
        className={isSelected ? 'selected' : undefined}
        aria-label={label}
        onClick={onClick}
        title={label}
      >
        {icon}
      </ButtonImpl>
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

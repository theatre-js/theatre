import type {ReactElement} from 'react'
import React from 'react'
import type {IconType} from 'react-icons'
import {Group, Button} from 'reakit'
import styled from 'styled-components'
import ButtonImpl from './ToolbarIconButton'

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

const Container = styled(Group)`
  display: flex;
  height: fit-content;
  backdrop-filter: blur(14px);
  border-radius: 2px;
`

export {Container as ToolbarSwitchSelectContainer}

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

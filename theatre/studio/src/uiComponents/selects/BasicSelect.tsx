import type {ElementType} from 'react'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-grow: 1;
`

const Label = styled.div`
  flex-grow: 0;
  color: hsl(0, 0%, 80%);
`

const SelectedValueLabel = styled.div`
  flex-grow: 1;
  padding-left: 8px;
`

type Option = {
  label: string
  value: string
}

const BasicSelect: React.FC<{
  label: string | ElementType
  options: Array<Option>
  value: string | undefined
  defaultOption: undefined | string
  onChange: (newValue: string) => void
}> = (props) => {
  // const [isOpen, setIsOpen] = useState<boolean>(false)
  const selectedValue =
    typeof props.value === 'string' ? props.value : props.defaultOption
  const selectedLabel = props.options.find(
    (opt) => opt.value === selectedValue,
  )?.label

  return (
    <Container>
      <Label>{props.label}</Label>
      <SelectedValueLabel>
        {selectedLabel}
        {/* <select
          value={selectedValue}
          onChange={(ev) => {
            props.onChange(ev.target.value)
          }}
        >
          {props.options.map((opt, i) => {
            return (
              <option key={'opt-' + i} value={opt.value}>
                {opt.label}
              </option>
            )
          })}
        </select> */}
      </SelectedValueLabel>
    </Container>
  )
}

export default BasicSelect

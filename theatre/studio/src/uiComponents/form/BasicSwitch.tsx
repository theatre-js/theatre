import {darken} from 'polished'
import React, {useCallback} from 'react'
import styled from 'styled-components'

const Container = styled.form`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  vertical-align: middle;
  justify-content: stretch;
  height: 24px;
  width: 100%;
`
const Label = styled.label`
  padding: 0 0.5em;
  background: transparent;
  /* background: #373748; */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  color: #a7a7a7;
  border: 1px solid transparent;
  box-sizing: border-box;
  border-right-width: 0px;

  & + &:last-child {
    border-right-width: 1px;
  }

  ${Container}:hover > & {
    border-color: #1c2123;
    /* background-color: #373748; */
    /* color: ${darken(0.1, 'white')}; */
  }

  &&:hover {
    background-color: #464654;
  }

  &&[data-checked='true'] {
    color: white;
    background: #3f3f4c;
  }
`

const Input = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
`

function BasicSwitch<TLiteralOptions extends string>({
  value,
  onChange,
  options,
}: {
  value: TLiteralOptions
  onChange: (val: TLiteralOptions) => void
  options: Record<TLiteralOptions, string>
}) {
  const _onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      onChange(String(el.target.value) as TLiteralOptions)
    },
    [onChange],
  )
  return (
    <Container role="radiogroup">
      {Object.keys(options).map((key, i) => (
        <Label key={'label-' + i} data-checked={value === key}>
          {options[key]}
          <Input
            type="radio"
            checked={value === key}
            value={key}
            onChange={_onChange}
            name="switchbox"
          />
        </Label>
      ))}
    </Container>
  )
}

export default BasicSwitch

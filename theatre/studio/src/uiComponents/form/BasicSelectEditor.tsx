import {theme} from '@theatre/studio/css'
import {darken, lighten} from 'polished'
import React, {useCallback} from 'react'
import styled from 'styled-components'

const Select = styled.select`
  background: transparent;
  box-sizing: border-box;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.9);
  padding: 1px 6px;
  font: inherit;
  outline: none;
  text-align: left;
  width: 100%;
  height: calc(100% - 4px);
  border-radius: 2px;

  &:hover,
  &:focus {
    background: ${darken(0.9, theme.panel.bg)};
    border: 1px solid ${lighten(0.1, theme.panel.bg)};
  }
`

const BasicSelectEditor: React.FC<{
  value: string
  onChange: (val: string) => void
  options: Record<string, string>
}> = ({value, onChange, options}) => {
  const _onChange = useCallback(
    (el: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(String(el.target.value))
    },
    [onChange],
  )
  return (
    <Select value={value} onChange={_onChange}>
      {Object.keys(options).map((key, i) => (
        <option key={'option-' + i} value={key}>
          {options[key]}
        </option>
      ))}
    </Select>
  )
}

export default BasicSelectEditor

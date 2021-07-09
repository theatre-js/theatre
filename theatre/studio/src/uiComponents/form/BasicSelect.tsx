import {theme} from '@theatre/studio/css'
import {darken, lighten} from 'polished'
import React, {useCallback} from 'react'
import styled from 'styled-components'

const Select = styled.select`
  background-color: transparent;
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

  /** Credit: https://github.com/tailwindlabs/tailwindcss-forms/blob/39946dd5d1c4cd980a3e8fd2a0c597f962fe285e/src/index.js#L86 */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 4px center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  color-adjust: exact;
  appearance: none;

  &:hover,
  &:focus {
    background-color: ${darken(0.9, theme.panel.bg)};
    border: 1px solid ${lighten(0.1, theme.panel.bg)};
  }
`

const BasicSelect: React.FC<{
  value: string
  onChange: (val: string) => void
  options: Record<string, string>
  className?: string
}> = ({value, onChange, options, className}) => {
  const _onChange = useCallback(
    (el: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(String(el.target.value))
    },
    [onChange],
  )
  return (
    <Select className={className} value={value} onChange={_onChange}>
      {Object.keys(options).map((key, i) => (
        <option key={'option-' + i} value={key}>
          {options[key]}
        </option>
      ))}
    </Select>
  )
}

export default BasicSelect

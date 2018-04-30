import React from 'react'
import * as css from './index.css'

type Props = {
  label: string
  options: Array<{value: string; label: string}>
  disabled?: boolean
  value?: string
  onChange: Function
}

const Select = ({label, options, disabled, value, onChange}: Props) => {
  return (
    <div className={css.container}>
      <label className={css.label}>{label}</label>
      <select
        onChange={onChange}
        value={value}
        disabled={disabled}
        className={css.select}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select

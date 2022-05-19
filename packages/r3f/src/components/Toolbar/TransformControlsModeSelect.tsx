import {ToolbarSwitchSelect} from '@theatre/studio'
import type {VFC} from 'react'
import React from 'react'
import {GiClockwiseRotation, GiMove, GiResize} from 'react-icons/gi'
import type {TransformControlsMode} from '../../store'

export interface TransformControlsModeSelectProps {
  value: TransformControlsMode
  onChange: (value: string) => void
}

const TransformControlsModeSelect: VFC<TransformControlsModeSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <ToolbarSwitchSelect
      value={value}
      onChange={onChange}
      options={[
        {
          value: 'translate',
          label: 'Tool: Translate',
          icon: <GiMove />,
        },
        {
          value: 'rotate',
          label: 'Tool: Rotate',
          icon: <GiClockwiseRotation />,
        },
        {
          value: 'scale',
          label: 'Tool: Scale',
          icon: <GiResize />,
        },
      ]}
    />
  )
}

export default TransformControlsModeSelect

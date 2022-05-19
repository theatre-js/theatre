import type {VFC} from 'react'
import React from 'react'
import type {TransformControlsSpace} from '../../store'
import {BiCube, BiGlobe} from 'react-icons/bi'
import {ToolbarSwitchSelect} from '@theatre/studio'

export interface TransformControlsSpaceSelectProps {
  value: TransformControlsSpace
  onChange: (value: TransformControlsSpace) => void
}

const TransformControlsSpaceSelect: VFC<TransformControlsSpaceSelectProps> = ({
  value,
  onChange,
}) => (
  <ToolbarSwitchSelect
    value={value}
    onChange={onChange}
    options={[
      {
        value: 'world',
        label: 'Space: World',
        icon: <BiGlobe />,
      },
      {
        value: 'local',
        label: 'Space: Local',
        icon: <BiCube />,
      },
    ]}
  />
)

export default TransformControlsSpaceSelect

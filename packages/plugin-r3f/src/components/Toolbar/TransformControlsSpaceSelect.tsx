import type {VFC} from 'react'
import React from 'react'
import type {TransformControlsSpace} from '../../store'
import {BiCube, BiGlobe} from 'react-icons/all'
import CompactModeSelect from './utils/CompactModeSelect'

export interface TransformControlsSpaceSelectProps {
  value: TransformControlsSpace
  onChange: (value: TransformControlsSpace) => void
}

const TransformControlsSpaceSelect: VFC<TransformControlsSpaceSelectProps> = ({
  value,
  onChange,
}) => (
  <CompactModeSelect
    value={value}
    onChange={onChange}
    options={[
      {
        option: 'world',
        label: 'Space: World',
        icon: <BiGlobe />,
      },
      {
        option: 'local',
        label: 'Space: Local',
        icon: <BiCube />,
      },
    ]}
  />
)

export default TransformControlsSpaceSelect

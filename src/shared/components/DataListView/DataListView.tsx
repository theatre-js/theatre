import React from 'react'
import css from './DataListView.css'
import {resolveCss} from '$shared/utils'

const classes = resolveCss(css)

interface IProps {
  dataList: string[]
  focusedIndex: number
  onFocus: (index: number) => void
  onSelect: (data: string) => void
}

interface IState {}

class DataListView extends React.PureComponent<IProps, IState> {
  render() {
    const {dataList, focusedIndex, onFocus, onSelect} = this.props
    return (
      <div {...classes('container')}>
        {dataList.map((data, index) => (
          <div
            key={data}
            {...classes('item', index === focusedIndex && 'focused')}
            onMouseEnter={() => onFocus(index)}
            onClick={() => onSelect(data)}
          >
            {data}
          </div>
        ))}
      </div>
    )
  }
}

export default DataListView

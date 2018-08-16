import React from 'react'
import {MenuAPIContext} from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import css from './LeafItem.css'
import {resolveCss} from '$shared/utils'

const classes = resolveCss(css)

interface IProps {
  title: string
  path: string[]
  isActive: boolean
}

interface IState {}

class LeafItem extends React.PureComponent<IProps, IState> {
  render() {
    const {title, path, isActive} = this.props
    return (
      <MenuAPIContext.Consumer>
        {({onSelect}) => (
          <div {...classes('item', isActive && 'active')} onClickCapture={() => onSelect(path)}>
            <div {...classes('title')}>{title}</div>
          </div>
        )}
      </MenuAPIContext.Consumer>
    )
  }
}

export default LeafItem

import React from 'react'
import css from './ItemsList.css'
import {TItems} from '$shared/components/MultiLevelDropdown/MultiLevelDropdown'
import {resolveCss} from '$shared/utils'
import LeafItem from '$shared/components/MultiLevelDropdown/LeafItem'
import InternalItem from '$shared/components/MultiLevelDropdown/InternalItem'
import {isInActivePath} from '$shared/components/MultiLevelDropdown/utils'

const classes = resolveCss(css)

interface IProps {
  items: TItems
  activePath: string[]
}

interface IState {}

class ItemsList extends React.PureComponent<IProps, IState> {
  render() {
    const {items, activePath} = this.props
    return (
      <div {...classes('container')}>
        {Object.entries(items).map(
          ([id, {isLeaf, isSelectable, path, __subItems__}]) =>
            isLeaf ? (
              <LeafItem
                key={path.join('/')}
                title={id}
                path={path}
                isActive={isInActivePath(activePath, path)}
              />
            ) : (
              <InternalItem
                key={path.join('/')}
                title={id}
                path={path}
                isSelectable={isSelectable}
                subItems={__subItems__}
                activePath={activePath}
                isActive={isInActivePath(activePath, path)}
              />
            ),
        )}
      </div>
    )
  }
}

export default ItemsList

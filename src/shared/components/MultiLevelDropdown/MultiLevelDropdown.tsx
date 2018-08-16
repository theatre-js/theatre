import React from 'react'
import css from './MultiLevelDropdown.css'
import {resolveCss} from '$shared/utils'
import ItemsList from '$shared/components/MultiLevelDropdown/ItemsList'
import Overlay from '$shared/components/Overlay/Overlay'

const classes = resolveCss(css)

interface IProps {
  items: TItems
  activePath: string[]
  onClickOutside?: () => void
  onSelect: TMenuAPI['onSelect']
}

interface IState {}

export type TItems = {
  [id: string]: {
    isLeaf: boolean
    isSelectable: boolean
    path: string[]
    internalPath: string[]
    __subItems__: TItems
  }
}

type TMenuAPI = {
  onSelect: (path: string[]) => void
}

export const MenuAPIContext = React.createContext({
  onSelect: () => {},
} as TMenuAPI)

class MultiLevelDropdown extends React.PureComponent<IProps, IState> {
  api: TMenuAPI = {
    onSelect: path => this.props.onSelect(path),
  }

  render() {
    const {onClickOutside, items, activePath} = this.props
    return (
      <MenuAPIContext.Provider value={this.api}>
        <div {...classes('positioner')}>
          <div {...classes('container')}>
            {onClickOutside != null ? (
              <Overlay onClickOutside={onClickOutside}>
                <Overlay.Section>
                  <ItemsList items={items} activePath={activePath} />
                </Overlay.Section>
              </Overlay>
            ) : (
              <Overlay.Section>
                <ItemsList items={items} activePath={activePath} />
              </Overlay.Section>
            )}
          </div>
        </div>
      </MenuAPIContext.Provider>
    )
  }
}

export default MultiLevelDropdown

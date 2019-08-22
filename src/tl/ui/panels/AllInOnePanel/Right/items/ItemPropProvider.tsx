import React from 'react'
import {val} from '$shared/DataVerse/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  IPropGetter as IRootPropGetter,
  IPropName as IRootPropName,
  RootPropGetterContext,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import {PrimitivePropItem} from '$tl/ui/panels/AllInOnePanel/utils'

interface IOwnProps {
  itemKey: PrimitivePropItem['key']
  itemAddress: PrimitivePropItem['address']
  itemHeight: PrimitivePropItem['height']
  itemExpanded: PrimitivePropItem['expanded']
  children: React.ReactNode
}

interface IProps extends IOwnProps {
  rootPropGetter: IRootPropGetter
}

interface IState {}

export const ItemPropGetterContext = React.createContext<IPropGetter>(() => {})

export type IPropName =
  | 'itemAddress'
  | 'itemKey'
  | 'itemHeight'
  | 'itemExpanded'
  | IRootPropName
export type IPropGetter = (propName: IPropName) => any

class ItemPropProvider extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const children = val(props.children)
          return (
            <ItemPropGetterContext.Provider value={this.getProp}>
              {children}
            </ItemPropGetterContext.Provider>
          )
        }}
      </PropsAsPointer>
    )
  }

  getProp: IPropGetter = propName => {
    switch (propName) {
      case 'itemHeight':
        return this.props.itemHeight
      case 'itemAddress':
        return this.props.itemAddress
      case 'itemKey':
        return this.props.itemKey
      case 'itemExpanded':
        return this.props.itemExpanded
      default:
        return this.props.rootPropGetter(propName)
    }
  }
}

export default (props: IOwnProps) => (
  <RootPropGetterContext.Consumer>
    {rootPropGetter => (
      <ItemPropProvider {...props} rootPropGetter={rootPropGetter} />
    )}
  </RootPropGetterContext.Consumer>
)

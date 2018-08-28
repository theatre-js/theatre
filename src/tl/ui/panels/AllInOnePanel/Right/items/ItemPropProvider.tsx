import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {
  TPropGetter as TRootPropGetter,
  TPropName as TRootPropName,
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
  rootPropGetter: TRootPropGetter
}

interface IState {}

export const ItemPropGetterContext = React.createContext<TPropGetter>(() => {})

export type TPropName =
  | 'itemAddress'
  | 'itemKey'
  | 'itemHeight'
  | 'itemExpanded'
  | TRootPropName
export type TPropGetter = (propName: TPropName) => any

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

  getProp: TPropGetter = propName => {
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

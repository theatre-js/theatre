import React from 'react'
import {Broadcast, Subscriber} from 'react-broadcast'
import {val} from '$shared/DataVerse/atom'
import {
  RootPropGetterChannel,
  TPropName as TRootPropName,
} from '$studio/AnimationTimelinePanel/RootPropProvider'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

export const VariablesPropGetterChannel = 'TheatreJS/VariablesPropGetterChannel'

interface IOwnProps {
  boxIndex: number
  boxHeight: number
  children: React.ReactNode
}

interface IProps extends IOwnProps {
  rootPropGetter: (propName: TRootPropName) => any
}

interface IState {}

export type TPropName = 'boxHeight' | 'boxIndex' | TRootPropName

export type TPropGetter = (propName: TPropName) => any

class VariablesPropProvider extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const children = val(props.children)
          return (
            <Broadcast
              channel={VariablesPropGetterChannel}
              value={this.getProp}
            >
              {children}
            </Broadcast>
          )
        }}
      </PropsAsPointer>
    )
  }

  getProp = (propName: TPropName) => {
    switch (propName) {
      case 'boxHeight':
        return this.props.boxHeight
      case 'boxIndex':
        return this.props.boxIndex
      default:
        return this.props.rootPropGetter(propName)
    }
  }
}

export default (props: IOwnProps) => (
  <Subscriber channel={RootPropGetterChannel}>
    {(rootPropGetter: IProps['rootPropGetter']) => (
      <VariablesPropProvider {...props} rootPropGetter={rootPropGetter} />
    )}
  </Subscriber>
)

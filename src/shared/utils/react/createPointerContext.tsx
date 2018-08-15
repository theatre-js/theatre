import React from 'react'
import atom, {Atom} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
// import PropsAsPointer, {ChildrenType} from '$shared/utils/react/PropsAsPointer'

export default function createPointerContext<T>() {
  const {Consumer, Provider: _Provider} = React.createContext(
    (null as $IntentionalAny) as Pointer<T>,
  )

  type Props = {children: React.ReactNode; value: T}

  class Provider extends React.Component<Props> {
    _atom: Atom<T>

    constructor(props: Props, context: $IntentionalAny) {
      super(props, context)
      const {value} = props
      this._atom = atom(value)
    }

    componentWillReceiveProps(newProps: Props) {
      this._atom.setState(newProps.value)
    }

    render() {
      return (
        <_Provider value={this._atom.pointer}>{this.props.children}</_Provider>
      )
    }
  }

  // const Consumer = ({children}: {children: ChildrenType<T>}) => {
  //   return (
  //     <_Consumer>
  //       {valueP => {
  //         return <PropsAsPointer>{() => children(valueP)}</PropsAsPointer>
  //       }}
  //     </_Consumer>
  //   )
  // }

  return {Consumer, Provider}
}

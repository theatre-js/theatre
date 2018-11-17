import React from 'react'
import atom, {Atom} from '$shared/DataVerse/atom'
import {Pointer} from '$shared/DataVerse/pointer'

export default function createPointerContext<T>() {
  const {Consumer: InnerConsumer, Provider: _Provider} = React.createContext(
    (null as $IntentionalAny) as Pointer<T>,
  )

  class Consumer extends React.PureComponent<
    {
      children: (t: Pointer<T>) => React.ReactNode
      // ref?: React.Ref<Consumer>
    },
    {}
  > {
    _vals: Pointer<T>
    /**
     * Use Consumer.ref() instead of React.createRef() to get a properly typed
     * ref object.
     */
    static ref = () => React.createRef<InstanceType<typeof Consumer>>()
    render() {
      return (
        <InnerConsumer>
          {vals => {
            this._vals = vals
            return this.props.children(vals)
          }}
        </InnerConsumer>
      )
    }

    get values() {
      return this._vals
    }
  }

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

  return {Consumer, Provider}
}

import PureComponentWithTheater from './PureComponentWithTheater'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import atom, {Atom} from '$shared/DataVerse2/atom'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import React from 'react'
import DerivationAsReactElement from '$theater/componentModel/react/utils/DerivationAsReactElement'
import {Pointer} from '$shared/DataVerse2/pointer'

export default abstract class ReactiveComponentWithTheater<
  Props extends {},
  State extends {} = {}
> extends PureComponentWithTheater<Props, {}> {
  _atom: Atom<{props: Props; state: State}>
  _renderD: AbstractDerivation<React.ReactNode>
  propsP: Pointer<Props>
  stateP: Pointer<State>
  // state: never

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this._atom = atom({props: props, state: this._getInitialState()})
    this.propsP = this._atom.pointer.props
    this.stateP = this._atom.pointer.state

    this._renderD = autoDerive(() => {
      return this._render()
    }).flatten()
  }

  _getInitialState(): State {
    return {} as State
  }

  setState(s: State | ((oldState: State) => State)) {
    const oldState = this._atom.getState().state
    if (typeof s === 'function') {
      const newState = {...(oldState as $FixMe), ...(s(oldState) as $FixMe)}
      this._atom.setState({...this._atom.getState(), state: newState})
    } else {
      this._atom.setState({
        ...this._atom.getState(),
        state: {...(oldState as $FixMe), ...(s as $FixMe)},
      })
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this._atom.setState({...this._atom.getState(), props: newProps})
  }

  render() {
    return <DerivationAsReactElement derivation={this._renderD} />
  }

  abstract _render(): React.ReactNode | AbstractDerivation<React.ReactNode>
}

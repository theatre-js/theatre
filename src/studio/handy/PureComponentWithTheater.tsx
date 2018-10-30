import {
  contextTypes,
  contextName,
} from '$studio/componentModel/react/utils/theaterContext'
import React from 'react'
import Theater, {TheaterStateAtom} from '$studio/bootstrap/Theater'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {GenericAction} from '$shared/types'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {UnwrapDictAtom} from '$shared/DataVerse/atoms/dictAtom'
import {ITheaterStoreState} from '$studio/types'
import {Pointer} from '$shared/DataVerse2/pointer'

/**
 * The main reason I made this as a component instead of just providing a HOC called `withStudio()` is that
 * I don't want to make react devtools's tree view too messy for our end-users. It'll probably make them
 * feel uncomfortable if for every TheaterJS component they see a whole bunch of HOCs.
 */
export default class PureComponentWithTheater<
  Props,
  State
> extends React.PureComponent<Props, State> {
  theaterAtomP: PointerDerivation<
    AbstractDerivedDict<UnwrapDictAtom<TheaterStateAtom>>
  >
  theater: Theater
  theaterAtom2P: Pointer<ITheaterStoreState>

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.theater = context[contextName]
    this.theaterAtomP = this.theater.atomP
    this.theaterAtom2P = this.theater.atom2.pointer
  }

  reduceState = (path: Array<string | number>, reducer: (s: any) => any) => {
    return this.dispatch(reduceStateAction(path, reducer))
  }

  dispatch = (action: GenericAction) => {
    this.theater.store.dispatch(action)
  }

  static contextTypes = contextTypes
}

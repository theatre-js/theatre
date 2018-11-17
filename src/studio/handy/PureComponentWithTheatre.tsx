import {
  contextTypes,
  contextName,
} from '$studio/componentModel/react/utils/studioContext'
import React from 'react'
import Theatre, {TheatreStateAtom} from '$studio/bootstrap/Theatre'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {GenericAction} from '$shared/types'
import {PointerDerivation} from '$shared/DataVerse/deprecated/atomDerivations/pointer'
import AbstractDerivedDict from '$shared/DataVerse/deprecated/atomDerivations/dicts/AbstractDerivedDict'
import {UnwrapDictAtom} from '$shared/DataVerse/deprecated/atoms/dictAtom'
import {ITheatreStoreState} from '$studio/types'
import {Pointer} from '$shared/DataVerse/pointer'

/**
 * The main reason I made this as a component instead of just providing a HOC called `withStudio()` is that
 * I don't want to make react devtools's tree view too messy for our end-users. It'll probably make them
 * feel uncomfortable if for every TheatreJS component they see a whole bunch of HOCs.
 */
export default class PureComponentWithTheatre<
  Props,
  State
> extends React.PureComponent<Props, State> {
  studioAtomP: PointerDerivation<
    AbstractDerivedDict<UnwrapDictAtom<TheatreStateAtom>>
  >
  studio: Theatre
  studioAtom2P: Pointer<ITheatreStoreState>

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.studio = context[contextName]
    this.studioAtomP = this.studio.atomP
    this.studioAtom2P = this.studio.atom2.pointer
  }

  reduceState = (path: Array<string | number>, reducer: (s: any) => any) => {
    return this.dispatch(reduceStateAction(path, reducer))
  }

  dispatch = (action: GenericAction) => {
    this.studio.store.dispatch(action)
  }

  static contextTypes = contextTypes
}

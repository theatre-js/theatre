import {contextTypes, contextName} from './studioContext'
import React from 'react'
import Studio, {StudioStateAtom} from '$studio/bootstrap/Studio'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {GenericAction} from '$shared/types'
import {PointerDerivation} from '$shared/DataVerse/derivations/pointer'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'
import {UnwrapDictAtom} from '$shared/DataVerse/atoms/dictAtom'

/**
 * The main reason I made this as a component instead of just providing a HOC called `withStudio()` is that
 * I don't want to make react devtools's tree view too messy for our end-users. It'll probably make them
 * feel uncomfortable if for every TheaterJS component they see a whole bunch of HOCs.
 */
export default class PureComponentWithStudio<
  Props,
  State
> extends React.PureComponent<Props, State> {
  studioAtomP: PointerDerivation<
    AbstractDerivedDict<UnwrapDictAtom<StudioStateAtom>>
  >
  studio: Studio

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.studio = context[contextName]
    this.studioAtomP = this.studio.atomP
  }

  reduceState = (path: Array<string | number>, reducer: (s: any) => any) => {
    return this.dispatch(reduceStateAction(path, reducer))
  }

  dispatch = (action: GenericAction) => {
    this.studio.store.reduxStore.dispatch(action)
  }

  static contextTypes = contextTypes
}

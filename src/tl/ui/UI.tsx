import {Atom} from '$shared/DataVerse2/atom'
import ReactDOM from 'react-dom'
import React from 'react'
import {rootReducer, uiActions} from './store'
import configureStore from '$shared/utils/redux/configureStore'
import {UIState} from '$tl/ui/store/types'
import {Store} from 'redux'
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore'
import {Pointer} from '$shared/DataVerse2/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import UIRootWrapper from '$tl/ui/UIRoot/UIRootWrapper'
import { GenericAction } from '$shared/types';
import {startPersisting} from '../Project/Project'

export default class UI {
  atom: Atom<UIState>
  reduxStore: Store<UIState>
  _enabled = false
  atomP: Pointer<UIState>
  ticker: Ticker
  actions: typeof uiActions = uiActions

  constructor() {
    this.reduxStore = configureStore({
      rootReducer,
      devtoolsOptions: {name: 'TheaterJS UI'},
    })
    this.atom = atomFromReduxStore(this.reduxStore)
    this.atomP = this.atom.pointer
    this.ticker = new Ticker()

    const onAnimationFrame = () => {
      this.ticker.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)

    startPersisting(this.reduxStore, this.actions, 'ui')
  }

  enable() {
    if (this._enabled)
      throw new Error(
        `TheaterJS UI is already enabled. You only need to call .enable() once`,
      )

    this._enabled = true
    this._render()
  }

  protected _render() {
    const containerEl = document.createElement('div')
    containerEl.className = 'theaterjsRoot'
    setTimeout(() => {
      document.body.appendChild(containerEl)
      ReactDOM.render(<UIRootWrapper ui={this} />, containerEl)
    }, 10)
  }

  _dispatch(...actions: GenericAction[]) {
    return this.reduxStore.dispatch(this.actions.batched(actions))
  }
}

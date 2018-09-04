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
import {GenericAction} from '$shared/types'
import {debounce} from '$shared/utils'

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

    startPersisting(this.reduxStore, this.actions)
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

export function startPersisting(reduxStore: $FixMe, actions: $FixMe) {
  const storageKey = $env.tl.uiPersistenceKey
  loadState()

  let lastHistory = reduxStore.getState().historic['@@history']
  const persist = () => {
    const newHistory = reduxStore.getState().historic['@@history']
    if (newHistory === lastHistory) return
    lastHistory = newHistory
    localStorage.setItem(storageKey, JSON.stringify(newHistory))
  }
  reduxStore.subscribe(debounce(persist, 1000))
  if (window) {
    window.addEventListener('beforeunload', persist)
  }

  function loadState() {
    const persistedS = localStorage.getItem(storageKey)
    if (persistedS) {
      let persistedObj
      try {
        persistedObj = JSON.parse(persistedS)
      } catch (e) {
        return
      }
      reduxStore.dispatch(
        actions.historic.__unsafe_replaceHistory(persistedObj),
      )
    }
  }
}

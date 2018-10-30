import {Atom} from '$shared/DataVerse2/atom'
import ReactDOM from 'react-dom'
import React from 'react'
import {rootReducer, uiActions} from './store'
import configureStore from '$shared/utils/redux/configureStore'
import {UIState, UIHistoricState, UIAhistoricState} from '$tl/ui/store/types'
import {Store} from 'redux'
import atomFromReduxStore from '$shared/utils/redux/atomFromReduxStore'
import {Pointer} from '$shared/DataVerse2/pointer'
import Ticker from '$shared/DataVerse/Ticker'
import UIRootWrapper from '$tl/ui/UIRoot/UIRootWrapper'
import {GenericAction} from '$shared/types'
import {debounce} from '$shared/utils'
import uiSelectors from '$tl/ui/store/selectors'
import {HistoryOnly} from '$shared/utils/redux/withHistory/withHistoryDeprecated'

export default class UI {
  atom: Atom<UIState>
  reduxStore: Store<UIState>
  _showing = false
  atomP: Pointer<UIState>
  ticker: Ticker
  actions: typeof uiActions = uiActions
  _selectors = uiSelectors
  containerEl = document.createElement('div')

  constructor() {
    // @ts-ignore ignore
    if ($env.NODE_ENV === 'development') window.ui = this
    this.reduxStore = configureStore({
      rootReducer,
      devtoolsOptions: {name: 'TheatreJS UI'},
    })
    this.atom = atomFromReduxStore(this.reduxStore)
    this.atomP = this.atom.pointer
    this.ticker = new Ticker()

    const onAnimationFrame = () => {
      this.ticker.tick()
      window.requestAnimationFrame(onAnimationFrame)
    }
    window.requestAnimationFrame(onAnimationFrame)

    startPersistingState({
      storageKey: $env.tl.uiPersistenceKey + '.historic',
      getState: () => this.reduxStore.getState().historic['@@history'],
      subscribe: this.reduxStore.subscribe,
      loadState: (s: HistoryOnly<UIHistoricState>) => {
        this.reduxStore.dispatch(
          this.actions.historic.__unsafe_replaceHistory(s),
        )
      },
    })

    startPersistingState({
      storageKey: $env.tl.uiPersistenceKey + '.ahistoric',
      getState: () => this.reduxStore.getState().ahistoric,
      subscribe: this.reduxStore.subscribe,
      loadState: (s: UIAhistoricState) =>
        this.reduxStore.dispatch(
          this.actions.ahistoric.__unsafeReplaceWholeState(s),
        ),
    })
  }

  show() {
    if (this._showing) return

    this._showing = true
    this._render()
  }

  protected _render() {
    this.containerEl.className = 'theatrejs-ui-root'
    setTimeout(() => {
      document.body.appendChild(this.containerEl)
      ReactDOM.render(<UIRootWrapper ui={this} />, this.containerEl)
    }, 10)
  }

  hide() {
    if (!this._showing) return
    document.body.removeChild(this.containerEl)
    ReactDOM.unmountComponentAtNode(this.containerEl)
  }

  _dispatch(...actions: GenericAction[]) {
    return this.reduxStore.dispatch(this.actions.batched(actions))
  }
}

function startPersistingState(p: {
  storageKey: string
  getState: () => mixed
  subscribe: (fn: () => void) => void
  loadState: (state: mixed) => void
}) {
  const storageKey = p.storageKey
  loadState()

  let lastState = p.getState()
  const persist = () => {
    const newState = p.getState()
    if (newState === lastState) return
    lastState = newState
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }
  p.subscribe(debounce(persist, 1000))
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
      p.loadState(persistedObj)
    }
  }
}

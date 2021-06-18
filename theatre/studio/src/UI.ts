import UIRootWrapper from '@theatre/studio/UIRoot/UIRootWrapper'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React from 'react'
import ReactDOM from 'react-dom'
import type Studio from './Studio'

export default class UI {
  readonly containerEl = document.createElement('div')
  _showing = false
  private _renderTimeout: NodeJS.Timer | undefined = undefined
  private _documentBodyUIIsRenderedIn: HTMLElement | undefined = undefined
  readonly containerShadow: HTMLElement

  constructor(readonly studio: Studio) {
    // @todo we can't bootstrap theatre (as in, to design theatre using theatre), if we rely on IDed elements
    this.containerEl.id = 'theatrejs-studio-root'

    this.containerEl.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
      z-index: 100;
    `
    this.containerShadow = this.containerEl.attachShadow({
      mode: 'open',
      // To see why I had to cast this value to HTMLElement, take a look at its
      // references. There are a few functions that actually work with a ShadowRoot
      // but are typed to accept HTMLElement
    }) as $IntentionalAny as HTMLElement
  }

  show() {
    if (this._showing) {
      if (this._documentBodyUIIsRenderedIn && document.body) {
        this.hide()
      } else {
        return
      }
    }
    this._showing = true

    this._render()
  }

  protected _render() {
    const renderCallback = () => {
      if (!document.body) {
        this._renderTimeout = setTimeout(renderCallback, 5)
        return
      }
      this._renderTimeout = undefined
      this._documentBodyUIIsRenderedIn = document.body
      this._documentBodyUIIsRenderedIn.appendChild(this.containerEl)
      ReactDOM.render(
        React.createElement(UIRootWrapper, {studio: this.studio}),
        this.containerShadow,
      )
    }
    this._renderTimeout = setTimeout(renderCallback, 10)
  }

  hide() {
    if (!this._showing) return
    this._showing = false
    if (this._renderTimeout) {
      clearTimeout(this._renderTimeout)
      this._renderTimeout = undefined
    } else {
      ReactDOM.unmountComponentAtNode(this.containerShadow)
      try {
        this._documentBodyUIIsRenderedIn!.removeChild(this.containerEl)
        this._documentBodyUIIsRenderedIn = undefined
      } catch (e) {}
    }
  }

  restore() {
    this.show()
    this.studio.transaction(({drafts}) => {
      drafts.ahistoric.visibilityState = 'everythingIsVisible'
    })
  }
}

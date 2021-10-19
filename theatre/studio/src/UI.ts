import UIRoot from '@theatre/studio/UIRoot/UIRoot'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import React from 'react'
import ReactDOM from 'react-dom'
import type {Studio} from './Studio'
import {val} from '@theatre/dataverse'

export default class UI {
  readonly containerEl = document.createElement('div')
  private _rendered = false
  private _renderTimeout: NodeJS.Timer | undefined = undefined
  private _documentBodyUIIsRenderedIn: HTMLElement | undefined = undefined
  readonly containerShadow: ShadowRoot & HTMLElement

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
      // references of this prop. There are a few functions that actually work
      // with a ShadowRoot but are typed to accept HTMLElement
    }) as $IntentionalAny as ShadowRoot & HTMLElement
  }

  render(renderInElement?: HTMLElement) {
    if (this._rendered) {
      return
    }
    this._rendered = true

    this._render(renderInElement)
  }

  protected _render(renderInElement?: HTMLElement) {
    const renderCallback = () => {
      if (!document.body) {
        this._renderTimeout = setTimeout(renderCallback, 5)
        return
      }
      this._renderTimeout = undefined
      this._documentBodyUIIsRenderedIn = renderInElement ?? document.body
      this._documentBodyUIIsRenderedIn.appendChild(this.containerEl)
      ReactDOM.render(React.createElement(UIRoot), this.containerShadow)
    }
    this._renderTimeout = setTimeout(renderCallback, 10)
  }

  hide() {
    this.studio.transaction(({drafts}) => {
      drafts.ahistoric.visibilityState = 'everythingIsHidden'
    })
  }

  restore() {
    this.render()
    this.studio.transaction(({drafts}) => {
      drafts.ahistoric.visibilityState = 'everythingIsVisible'
    })
  }

  get isHidden() {
    return (
      val(this.studio.atomP.ahistoric.visibilityState) === 'everythingIsHidden'
    )
  }
}

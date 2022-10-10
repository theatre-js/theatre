import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type React from 'react'
import {getMounter} from './renderInPortalInContext'

export function registerContextualWebComponent<Props>(
  ReactComponent: React.ComponentType<Props>,
  componentName: string,
  // currently only supporting string prop types
  propKeys: {[propKey in keyof Props]: 'string'},
): void {
  if (typeof window === 'undefined' || typeof customElements === 'undefined')
    return

  const propList = Object.keys(propKeys)

  class CustomWebComponent extends HTMLElement {
    _mounted = false
    _mountOrRender: ReturnType<typeof getMounter>['mountOrRender']
    _unmount: ReturnType<typeof getMounter>['unmount']
    static get observedAttributes() {
      return propList
    }
    constructor() {
      super()
      const {mountOrRender, unmount} = getMounter()
      this._mountOrRender = mountOrRender
      this._unmount = unmount
    }

    connectedCallback() {
      // const shadow = this.attachShadow({mode: 'open'})
      this._mounted = true
      this._render()
    }

    _render() {
      const props = Object.fromEntries(
        propList.map((propName) => [
          propName,
          this.getAttribute(propName as $IntentionalAny),
        ]),
      )
      this._mountOrRender(ReactComponent, props as $IntentionalAny, this)
    }

    attributeChangedCallback() {
      if (!this._mounted) return
      this._render()
    }

    disconnectedCallback() {
      this._mounted = false
      this._unmount()
    }
  }

  customElements.define(componentName, CustomWebComponent)
}

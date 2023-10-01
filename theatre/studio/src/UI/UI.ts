import type {Studio} from '@theatre/studio/Studio'
import {val} from '@theatre/dataverse'

const NonSSRBitsClass =
  typeof window !== 'undefined'
    ? import('./UINonSSRBits').then((M) => M.default)
    : null

export default class UI {
  private _rendered = false
  private _nonSSRBits = NonSSRBitsClass
    ? NonSSRBitsClass.then((NonSSRBitsClass) => new NonSSRBitsClass())
    : Promise.reject()
  readonly ready: Promise<void> = this._nonSSRBits.then(
    () => undefined,
    () => undefined,
  )

  constructor(readonly studio: Studio) {}

  render() {
    if (this._rendered) {
      return
    }
    this._rendered = true

    this._nonSSRBits
      .then((b) => {
        b.render()
      })
      .catch((err) => {
        console.error(err)
        throw err
      })
  }

  hide() {
    this.studio.transaction(({stateEditors}) => {
      stateEditors.studio.ahistoric.setVisibilityState('everythingIsHidden')
    })
  }

  restore() {
    this.render()
    this.studio.transaction(({stateEditors}) => {
      stateEditors.studio.ahistoric.setVisibilityState('everythingIsVisible')
    })
  }

  get isHidden() {
    return (
      val(this.studio.atomP.ahistoric.visibilityState) === 'everythingIsHidden'
    )
  }

  renderToolset(toolsetId: string, htmlNode: HTMLElement) {
    let shouldUnmount = false

    let unmount: null | (() => void) = null

    this._nonSSRBits
      .then((nonSSRBits) => {
        if (shouldUnmount) return // unmount requested before the toolset is mounted, so, abort
        unmount = nonSSRBits.renderToolset(toolsetId, htmlNode)
      })
      .catch((err) => {
        console.error(err)
      })

    return () => {
      if (unmount) {
        unmount()
        return
      }
      if (shouldUnmount) return
      shouldUnmount = true
    }
  }
}

import type {ISheetObject} from '@theatre/core'
import type {IStudio} from '@theatre/studio'
import * as DS from './ds-hid'

export type API = {
  orientation: {
    applyGyro: () => void
    apply: () => void
    reset: () => void
  }
  object: ISheetObject
  studio: IStudio
}

type DSBindings = {
  orientation?: (x: number, y: number, z: number, w: number, api: API) => void

  cross?: (pressed: boolean, api: API) => void
  square?: (pressed: boolean, api: API) => void
  circle?: (pressed: boolean, api: API) => void
  triangle?: (pressed: boolean, api: API) => void
}

type Selector = (address: ISheetObject['address']) => boolean

export default class DualSenseBindings {
  private _controller: DS.DSController | null = null
  private _studio
  private _bindings: Set<{bindings: DSBindings; selector: Selector}> = new Set()

  private _buttons = {
    cross: false,
    square: false,
    circle: false,
    triangle: false,
  }

  constructor(studio: IStudio) {
    this._studio = studio
  }

  async connect() {
    this._controller = await DS.connectController()

    this._controller.addEventListener('stateChange', (evt) => {
      const item = this._studio.selection.find(
        (s): s is ISheetObject => s.type === 'Theatre_SheetObject_PublicAPI',
      )

      if (!item) return

      const api: API = {
        orientation: this._controller!.attitude,
        object: item,
        studio: this._studio,
      }

      this._bindings.forEach((bindings) => {
        if (!bindings.selector(item.address)) return

        bindings.bindings.orientation?.(
          ...(Object.values(evt.state.attitude) as [
            number,
            number,
            number,
            number,
          ]),
          api,
        )

        if (evt.state.cross !== this._buttons.cross) {
          bindings.bindings.cross?.(evt.state.cross, api)
        }
        if (evt.state.square !== this._buttons.square) {
          bindings.bindings.square?.(evt.state.square, api)
        }
        if (evt.state.circle !== this._buttons.circle) {
          bindings.bindings.circle?.(evt.state.circle, api)
        }
        if (evt.state.triangle !== this._buttons.triangle) {
          bindings.bindings.triangle?.(evt.state.triangle, api)
        }
      })

      this._buttons.cross = evt.state.cross
      this._buttons.square = evt.state.square
      this._buttons.circle = evt.state.circle
      this._buttons.triangle = evt.state.triangle
    })

    return () => {
      this._controller?.disconnect()
      this._controller = null
    }
  }

  addBinding(bindings: DSBindings, selector: Selector = () => true) {
    const item = {
      bindings,
      selector,
    }
    this._bindings.add(item)

    return () => {
      this._bindings.delete(item)
    }
  }
}

export * from './bindingCreators'

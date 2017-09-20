// @flow
import * as D from '$shared/DataVerse'
import forEach from 'lodash/forEach'

class AttributeApplier {
  _key: *
  _box: *
  _el: *
  _untap: *

  constructor(key: string, box: D.IReactiveBox<$FixMe>, el: Element) {
    this._key = key
    this._box = box
    this._el = el
    // $FixMe
    this._untap = box.changes().tapImmediate((newValue) => {
      if (typeof newValue === 'string') {
        el.setAttribute(key, newValue)
      } else {
        el.removeAttribute(key)
      }
    })
  }

  remove() {
    this._untap()
    this._el.removeAttribute(this._key)
  }
}

export default function createDidMountHookForAttributes(ctx: $FixMe) {
  () => {
    const fnsToCallForStoppingThis = []
    ctx.front.prop('atom').setProp('stopApplyingAtributes', () => fnsToCallForStoppingThis.forEach((fn) => {fn()}))

    fnsToCallForStoppingThis.push(ctx.front.pointer().prop('atom').prop('elRef').derivative().tapImmediate((el: ?Element) => {
      if (!el) return

      const attrs = new D.DerivedMap()
      fnsToCallForStoppingThis.push(ctx.front.pointer().prop('domAttributes').derivative().tapImmediate((domAttributes) => {
        attrs.delegateTo(domAttributes)
      }))

      const appliers = {}

      fnsToCallForStoppingThis.push(attrs.changes().tapImmediate((change: D.MapAtomChangeType<any>) => {
        change.deletedKeys.forEach((key) => {
          appliers[key].remove()
          delete appliers[key]
        })

        forEach((change.overriddenRefs: {}), (v, key) => {
          if (appliers[key])
            appliers[key].remove()

          appliers[key] = new AttributeApplier(key, v, (el: $FixMe))
        })
      }))

      fnsToCallForStoppingThis.push(() => {
        forEach(appliers, (applier) => {
          applier.remove()
        })
      })
    }))

  }
}
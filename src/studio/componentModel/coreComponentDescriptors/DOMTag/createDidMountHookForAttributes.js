
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
    const reactToValueChange = (newValue) => {
      if (typeof newValue === 'string') {
        el.setAttribute(key, newValue)
      } else {
        el.removeAttribute(key)
      }
    }
    this._untap = box.changes().tap(reactToValueChange)
    reactToValueChange(box.getValue())
  }

  remove() {
    this._untap()
    this._el.removeAttribute(this._key)
  }
}

export default function createDidMountHookForAttributes(d: $FixMe, context: $FixMe) {
  () => {
    const fnsToCallForStoppingThis = []
    d.front.prop('atom').setProp('stopApplyingAtributes', () => fnsToCallForStoppingThis.forEach((fn) => {fn()}))

    fnsToCallForStoppingThis.push(d.front.pointer().prop('atom').prop('elRef').derivative().tapImmediate((el: ?Element) => {
      if (!el) return

      const attrs = new D.DerivedMap({}).face(context)
      fnsToCallForStoppingThis.push(d.front.pointer().prop('domAttributes').derivative().tapImmediate((domAttributes) => {
        attrs.setHead(domAttributes)
      }))

      const appliers = {}

      const reactToAttributeChange = (change: D.MapAtomChangeType<any>) => {
        change.deletedKeys.forEach((key) => {
          appliers[key].remove()
          delete appliers[key]
        })

        forEach((change.overriddenRefs: {}), (v, key) => {
          if (appliers[key])
            appliers[key].remove()

          appliers[key] = new AttributeApplier(key, v, (el: $FixMe))
        })
      }
      fnsToCallForStoppingThis.push(attrs.changes().tap(reactToAttributeChange))

      fnsToCallForStoppingThis.push(() => {
        forEach(appliers, (applier) => {
          applier.remove()
        })
      })
    }))

  }
}

// type Theme = { [className: string]: string };
// export type MergeThemeHOC = <T: {}>(injectedTheme: T) => HigherOrderComponent<{theme?: $Shape<T>}, {theme: T}>
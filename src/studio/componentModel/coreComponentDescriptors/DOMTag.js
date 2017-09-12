k// @flow
import {TheaterJSComponent, typeSystem} from '$studio/handy'
import * as D from '$shared/DataVerse'
import * as React from 'react'
import {type ComponentDescriptor, type ComponentInstantiationDescriptor} from '$studio/componentModel/types'

const reifyValue = (pointerToValue, wire) => {

}

const applyModifiers = (wire: $FixMe): $FixMe => {

}

const base = {
  acceptsFilters() {return true},
  ref() {
    return new D.Reference(null)
  },
  refCallback(currentWire: $FixMe) {
    return new D.Reference((ref) => {
      currentWire.get('ref').set(ref)
    })
  },
  render(wire: $FixMe) {
    return new D.Derivation(
      {
        tagName: wire.get('props').get('tagName'),
        children: reifyValue(wire.get('props').get('children'), wire),
        refCallback: wire.get('refCallback'),
      },
      ({tagName, children, refCallback}) => { // eslint-disable-line react/display-name
        return React.createElement(tagName.get(), {ref: refCallback.get()}, children.get())
      },
    )
  },
  style() {
    return new D.IterableMapWire({})
  },
  applyStyles(wire: $FixMe) {
    const stopFnRef = new D.Reference(() => {})
    wire.set('stopApplyingWiresFn', stopFnRef)
    stopFnRef.set(wire.get('ref').changes.tap((theDomElOrNull) => {
      if (!theDomElOrNull) return
      stopFnRef.set(wire.get('style').tapIntoPropChangesIncludingCurrent((propKey, propValue) => {

      }))
    }))
  },

  componentDidMountHooks(wire: $FixMe, upperWire: $FixMe): $FixMe {
    return upperWire.get('componentDidMountHooks').map((theHooks: $FixMe) => {
      return theHooks.concat([
        // dragons
      ])
    })
  },

  componentWillUnmountHooks(wire: $FixMe, upperWire: $FixMe): $FixMe {
    return upperWire.get('componentWillUnmountHooks').map((theHooks: $FixMe) => {
      return theHooks.concat([
        () => {
          const fn = wire.get('stopApplyingWiresFn').currentValue
          if (fn) fn()
        },
      ])
    })
  },
}

class DOMTag extends TheaterJSComponent<{}> {

  modifyInitialWire(initialWire: $FixMe) {
    const extendedWithBase = initialWire.extend(base)
    const extendedWithModifiers = applyModifiers(extendedWithBase)
    return extendedWithModifiers
  }
}

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/DOMTag',
  type: 'HardCoded',
  reactComponent: DOMTag,
  propTypes: typeSystem.ObjectType({
    tagName: typeSystem.union([typeSystem.literal('div'), typeSystem.literal('span')]),
    children: typeSystem.ComponentInstantiationDescriptor,
  }),
}

export default descriptor
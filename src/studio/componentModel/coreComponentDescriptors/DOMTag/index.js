// @flow
import * as D from '$shared/DataVerse'
import * as React from 'react'
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import forEach from 'lodash/forEach'
import noop from 'lodash/noop'

class AttributeApplier {
  _key: *
  _box: *
  _el: *
  _untap: *

  constructor(key: string, box: $FixMe, el: Element) {
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

const didMountHooks = [(d) => {
  const context = d.pointer().prop('dataVerseContext').getValue()

  const fnsToCallForStoppingThis = []
  d.prop('state').getValue().setProp('stopApplyingAtributes', () => {
    fnsToCallForStoppingThis.forEach((fn) => {fn()})
    fnsToCallForStoppingThis.length = 0
  })

  let lastElRef: ?HTMLElement = undefined
  const elRefP = d.pointer().prop('state').prop('elRef')

  const reactToElRefChange = (newRef: ?HTMLElement) => {
    if (newRef === lastElRef) return

    if (lastElRef) {
      // el ref has either changed to a new element, or it has changed to undefined.
      // in both cases, we should stop applying the previous attributes
      d.pointer().prop('state').prop('stopApplyingAtributes').getValue()()
      fnsToCallForStoppingThis.push(elRefP.setDerivationContext(context).changes().tap(reactToElRefChange))
      lastElRef = newRef
    }

    if (!newRef) return
    const currentRef = newRef

    // const prototypalDictFaceOfAttributes = new D.derivations.prototypalDictFace()

  }

  fnsToCallForStoppingThis.push(elRefP.setDerivationContext(context).changes().tap(reactToElRefChange))
  reactToElRefChange(elRefP.getValue())

  return

  // fnsToCallForStoppingThis.push(d.front.pointer().prop('atom').prop('elRef').derivative().tapImmediate((el: ?Element) => {
  //   if (!el) return

  //   const attrs = new D.DerivedDict({}).face()
  //   fnsToCallForStoppingThis.push(d.front.pointer().prop('domAttributes').derivative().tapImmediate((domAttributes) => {
  //     attrs.setHead(domAttributes)
  //   }))

  //   const appliers = {}

  //   const reactToAttributeChange = (change: D.DictAtomChangeType<any>) => {
  //     change.deletedKeys.forEach((key) => {
  //       appliers[key].remove()
  //       delete appliers[key]
  //     })

  //     forEach((change.overriddenRefs: {}), (v, key) => {
  //       if (appliers[key])
  //         appliers[key].remove()

  //       appliers[key] = new AttributeApplier(key, v, (el: $Fixe))
  //     })
  //   }
  //   fnsToCallForStoppingThis.push(attrs.changes().tap(reactToAttributeChange))

  //   fnsToCallForStoppingThis.push(() => {
  //     forEach(appliers, (applier) => {
  //       applier.remove()
  //     })
  //   })
  // }))
}]

const willUnmountHooks = [(d) => {
  const stopApplyingAtributes = d.pointer().prop('state').prop('stopApplyingAtributes').getValue()
  stopApplyingAtributes(d)
}]

const lookupTable = {
  render: (d) => {
    const p = d.pointer().prop('modifierInstantiationDescriptorsByID').prop('0')
    console.log(p.getValue())
    const children = d.pointer().prop('props').prop('children')
    const refFn = d.pointer().prop('refFn')
    const tagName = d.pointer().prop('props').prop('tagName')
    return D.derivations.autoDerive(() => {
      return React.createElement(tagName.getValue(), {ref: refFn.getValue()}, children.getValue())
    })
  },

  refFn: (d) => {
    const stateP = d.pointer().prop('state')
    return D.derivations.autoDerive(() => {
      const state: D.IDictAtom<{elRef: D.IBoxAtom<?HTMLElement>}> = stateP.getValue()

      return function setElRef(el) {
        state.setProp('elRef', D.atoms.box(el))
      }
    })
  },

  domAttributes: () => {
    return D.derivations.emptyDict
  },

  componentDidMountCallbacks: (d) => {
    return d.propFromAbove('componendDidMountCallbacks').map((callbacks: D.IDerivedArray<*>) => callbacks.concat(didMountHooks))
  },

  componentWillUnmountCallbacks: (d) => {
    return d.propFromAbove('componendWillUnmountCallbacks').map((callbacks: D.IDerivedArray<*>) => callbacks.concat(willUnmountHooks))
  },
}

const applyModifiers = (dict: $FixMe, dataVerseContext: D.Context) => {
  // dict.extend((d) => {
    // d.prop()
  // })
  return dict
}

type State = D.IDictAtom<{
  elRef: D.IBoxAtom<?HTMLElement>,
  stopApplyingAtributes: D.IBoxAtom<(derivation: $FixMe) => void>,
}>

const DOMTag = makeReactiveComponent({
  displayName: 'TheaterJS/Core/DOMTag',
  getInitialState(): State {
    return D.atoms.dict({
      elRef: D.atoms.box(null),
      stopApplyingAtributes: D.atoms.box(noop),
    })
  },
  modifyPrototypalDict: (dict: D.IPrototypalDict<$FixMe>, dataVerseContext: D.Context) => applyModifiers(dict.extend(lookupTable), dataVerseContext),
})

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/DOMTag',
  type: 'HardCoded',
  reactComponent: DOMTag,
}

export default descriptor
// @flow
import * as D from '$shared/DataVerse'
import * as React from 'react'
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import AttributesApplier from './AttributesApplier'
import noop from 'lodash/noop'

const blah = D.atoms.box('blah')

// let n = 0
// setInterval(() => {
//   n++
//   blah.set('blah' + n)
// }, 10)

const dd = D.atoms.dict({
  'class': blah,
}).derivedDict()


const sideEffects = D.atoms.dict({
  applyAttributes: D.atoms.box((dict, dvContext) => {
    const applier = new AttributesApplier(dict, dvContext)
    applier.start()

    return () => {
      applier.stop()
    }
  }),
}).derivedDict()

const lookupTable = {
  render: (d) => {
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
    return dd
    // return D.derivations.emptyDict
  },

  sideEffects(d) {
    return d.propFromAbove('sideEffects').map((sf: D.IDerivedDict<$FixMe>) => sf.extend(sideEffects))
  },
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
  modifyPrototypalDict: (dict: D.IPrototypalDict<$FixMe>) => dict.extend(lookupTable),
})

const {object, primitive} = D.literals

const descriptor: ComponentDescriptor = object({
  id: primitive('TheaterJS/Core/DOMTag'),
  type: primitive('HardCoded'),
  reactComponent: primitive(DOMTag),
})

export default descriptor
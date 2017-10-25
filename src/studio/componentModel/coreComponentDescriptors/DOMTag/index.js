import * as D from '$shared/DataVerse'  // eslint-disable-line flowtype/require-valid-file-annotation
import * as React from 'react'
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'

const lookupTable = {
  render: (d) => {
    const children = d.pointer().prop('props').prop('children')
    // const children = d.pointer().prop('props').prop('children').unbox()
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
}

type State = D.IDictAtom<{
  elRef: D.IBoxAtom<?HTMLElement>,
  stopApplyingAtributes: D.IBoxAtom<(derivation: $FixMe) => void>,
}>

const componentId = 'TheaterJS/Core/DOMTag'

const DOMTag = makeReactiveComponent({
  componentId,
  displayName: componentId,
  getInitialState(): State {
    return D.atoms.dict({
      elRef: D.atoms.box(null),
    })
  },
  modifyPrototypalDict: (dict: D.IPrototypalDict<$FixMe>) => dict.extend(lookupTable),
})

const descriptor: ComponentDescriptor = {
  id: componentId,
  type: 'HardCoded',
  reactComponent: DOMTag,
}

export default descriptor
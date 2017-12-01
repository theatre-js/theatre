// @flow
import * as D from '$shared/DataVerse' // eslint-disable-line flowtype/require-valid-file-annotation
import * as React from 'react'
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'

const lookupTable = {
  tagName: d => {
    return d
      .pointer()
      .prop('props')
      .prop('tagName')
  },

  render: d => {
    const childrenD = d
      .pointer()
      .prop('props')
      .prop('children')
      .toJS()

    const refFn = d.pointer().prop('refFn')
    const tagName = d.pointer().prop('tagName')

    return D.derivations.autoDerive(() => {
      return React.createElement(
        tagName.getValue(),
        {ref: refFn.getValue()},
        childrenD.getValue(),
      )
    })
  },

  refFn: d => {
    const stateP = d.pointer().prop('state')
    return D.derivations.autoDerive(() => {
      const state: D.IDictAtom<{
        elRef: D.IBoxAtom<?HTMLElement>,
      }> = stateP.getValue()

      return function setElRef(el) {
        state.setProp('elRef', D.atoms.box(el))
      }
    })
  },
}

type State = D.IDictAtom<{
  elRef: D.IBoxAtom<?HTMLElement>,
}>

const componentId = 'TheaterJS/Core/DOMTag'

export const propsTomakeReactiveComponent = {
  componentId,
  displayName: componentId,
  componentType: 'HardCoded',
  getInitialState(): State {
    return D.atoms.dict({
      elRef: D.atoms.box(null),
    })
  },
  modifyPrototypalDict: (dict: D.IPrototypalDict<$FixMe>) => dict.extend(lookupTable),
}

const DOMTag = makeReactiveComponent(propsTomakeReactiveComponent)

const descriptor: ComponentDescriptor = {
  id: componentId,
  displayName: 'DOMTag',
  type: 'HardCoded',
  reactComponent: DOMTag,
}

export default descriptor

const makeSeparateComponentForEachDomTag = () => {
  const supportedTags = [
    'div',
    'span',
    'header',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'button',
    'footer',
    'input',
    'picture',
    'video',
  ]

  const components = {}

  supportedTags.forEach(tagName => {
    const id = 'TheaterJS/Core/HTML/' + tagName
    const componentDescriptor = {
      ...descriptor,
      id,
      displayName: tagName,
      // $FlowIgnore
      reactComponent: makeReactiveComponent({
        ...propsTomakeReactiveComponent,
        componentId: id,
        displayName: tagName,
        modifyPrototypalDict: (dict: D.IPrototypalDict<$FixMe>) =>
          dict.extend({
            ...lookupTable,
            tagName() {
              return tagName
            },
          }),
      }),
    }

    components[id] = componentDescriptor
  })

  return components
}

export const componentsForEachTag = makeSeparateComponentForEachDomTag()

// @flow
import * as D from '$shared/DataVerse' // eslint-disable-line flowtype/require-valid-file-annotation
import * as React from 'react'
import {ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import {DerivedClass} from '$src/shared/DataVerse/derivedClass/derivedClass'

const lookupTable = {
  tagName: self => {
    return self
      .pointer()
      .prop('props')
      .prop('tagName')
  },

  render: self => {
    const childrenD = self
      .pointer()
      .prop('props')
      .prop('children')
      .toJS()

    const refFn = self.pointer().prop('refFn')
    const tagName = self.pointer().prop('tagName')

    return D.derivations.autoDerive(() => {
      return React.createElement(
        tagName.getValue(),
        {ref: refFn.getValue()},
        childrenD.getValue(),
      )
    })
  },

  refFn: self => {
    const stateP = self.pointer().prop('state')
    return D.derivations.autoDerive(() => {
      const state: D.IDictAtom<{
        elRef: D.IBoxAtom<undefined | null | HTMLElement>
      }> = stateP.getValue()

      return function setElRef(el) {
        state.setProp('elRef', D.atoms.box(el))
      }
    })
  },
}

type State = D.IDictAtom<{
  elRef: D.IBoxAtom<undefined | null | HTMLElement>
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
  getClass: (dict: DerivedClass<$FixMe>) => dict.extend(lookupTable),
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
        getClass: (dict: DerivedClass<$FixMe>) =>
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

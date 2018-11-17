import React from 'react'
import {IComponentDescriptor} from '$studio/componentModel/types'
import {DerivedClass} from '$shared/DataVerse/derivedClass/derivedClass'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import boxAtom from '$shared/DataVerse/atomsDeprecated/boxAtom'
import dictAtom from '$shared/DataVerse/atomsDeprecated/dictAtom'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import TheatreComponent from '$studio/componentModel/react/TheatreComponent/TheatreComponent'
import {DictAtom} from '$shared/DataVerse/atomsDeprecated/dictAtom'

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

    const classP = self
      .pointer()
      .prop('props')
      .prop('class')

    return withDeps({tagName, refFn, classP, childrenD}, () => {
      return React.createElement(
        tagName.getValue(),
        {ref: refFn.getValue(), className: classP.getValue()},
        childrenD.getValue(),
      )
    })
  },

  refFn: self => {
    const stateP = self.pointer().prop('state')
    return autoDerive(() => {
      const state: DictAtom<{
        elRef: BoxAtom<undefined | null | HTMLElement>
      }> = stateP.getValue()

      return function setElRef(el) {
        state.setProp('elRef', boxAtom(el))
      }
    })
  },
}

type State = DictAtom<{
  elRef: BoxAtom<undefined | null | HTMLElement>
}>

const componentId = 'TheatreJS/Core/DOMTag'

class DOMTag extends TheatreComponent {
  static componentId = componentId
  static displayName = 'DOMTag'
  static componentType = 'HardCoded'
  static shouldSwallowChild = true // don't try this at home

  _getClass(dict: DerivedClass<$FixMe>): DerivedClass<$FixMe> {
    return dict.extend(lookupTable)
  }

  _getInitialState(): State {
    return dictAtom({
      elRef: boxAtom(null),
    })
  }
}

const descriptor: IComponentDescriptor = {
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
    'footer',
    'aside',
    'section',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'nav',
    'button',
    'input',
    'picture',
    'video',
    'article',
    'address',
    'ul',
    'ol',
    'li',
    'p',
    'pre',
    'main',
  ]

  const components: {[id: string]: $FixMe} = {}

  supportedTags.forEach(tagName => {
    const id = 'TheatreJS/Core/HTML/' + tagName
    const componentDescriptor = {
      ...descriptor,
      id,
      displayName: tagName,
      reactComponent: class extends DOMTag {
        static componentId = id
        static displayName = tagName
        _getClass(dict: DerivedClass<$FixMe>) {
          return dict.extend({
            ...lookupTable,
            tagName() {
              return tagName
            },
          })
        }
      },
      // $FlowIgnore
      // reactComponent: TheatreComponent({
      //   ...propsToTheatreComponent,
      //   getClass: (dict: DerivedClass<$FixMe>) =>
      //     dict.extend({
      //       ...lookupTable,
      //       tagName() {
      //         return tagName
      //       },
      //     }),
      // }),
    }

    components[id] = componentDescriptor
  })

  return components
}

export const componentsForEachTag = makeSeparateComponentForEachDomTag()

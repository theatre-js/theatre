// @flow
import * as React from 'react'
// import {type ComponentInstantiationDescriptor, type ComponentDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import {makeReactiveComponent} from '$studio/handy'
import ElementifyHardCodedComponent from './ElementifyHardCodedComponent'
import ElementifyDeclarativeComponent from './ElementifyDeclarativeComponent'
import type {Studio} from '$studio/handy'
import stringStartsWith from 'lodash/startsWith'

const identity = (a) => a

// type Props = {
//   instantiationDescriptor: ComponentInstantiationDescriptor,
// }

const getComponentDescriptorById = (id: D.IDerivation<string>, studio: D.IDerivation<$FixMe>): $FixMe =>
  D.derivations.withDeps({id, studio}, identity).flatMap(({id, studio}): $FixMe => {
    const idString = id.getValue()
    return stringStartsWith(idString, 'TheaterJS/Core/')
      ? studio.getValue().atom.pointer().prop('coreComponentDescriptorsById').prop(idString)
      : studio.getValue().atom.pointer().prop('state').prop('componentModel').prop('componentDescriptorsById').prop(idString)
  })

const getAliasLessComponentDescriptor = (initialComponentId: D.IDerivation<string>, studio: D.IDerivation<Studio>): $FixMe => {
  return getComponentDescriptorById(initialComponentId, studio).flatMap((des): $FixMe => {
    if (!des) return

    return des.pointer().prop('type').flatMap((type) => {
      if (type === 'Alias') {
        return des.pointer().prop('aliasedComponentId').flatMap((aliasedComponentId) => getAliasLessComponentDescriptor(D.derivations.constant(aliasedComponentId), studio))
      } else {
        return des
      }
    })
  })
}

export default makeReactiveComponent({
  displayName: 'Elementify',
  modifyPrototypalDict: (d) => d.extend({
    render(d) {
      const instantiationDescriptorPointer = d.pointer().prop('props').prop('instantiationDescriptor')
      const componentIdP = instantiationDescriptorPointer.prop('componentId')
      return getAliasLessComponentDescriptor(
        componentIdP, d.pointer().prop('studio')
      ).flatMap((componentDescriptor) => {
        if (!componentDescriptor) return D.derivations.autoDerive(() => {

          return <div>Cannot find component {componentIdP.getValue()}</div>
        })

        // console.log(componentIdP.getValue(), instantiationDescriptorPointer.prop('modifierInstantiationDescriptors').getValue())
        // setTimeout(() => {
        //   console.log(instantiationDescriptorPointer._trace)
        // }, 200)
        console.log(instantiationDescriptorPointer)

        const componentDescriptorP = componentDescriptor.pointer()
        const componentDescriptorTypePointer = componentDescriptorP.prop('type')
        const keyPointer = d.pointer().prop('key')
        const innerProps = D.atoms.dict({
          componentDescriptor: componentDescriptorP,
          props: instantiationDescriptorPointer.prop('props'),
          modifierInstantiationDescriptors: instantiationDescriptorPointer.prop('modifierInstantiationDescriptors'),
        }).derivedDict()

        return D.derivations.autoDerive(() => {
          if (componentDescriptorTypePointer.getValue() === 'HardCoded') {
            return <ElementifyHardCodedComponent key={keyPointer.getValue()} props={innerProps} />
          } else {
            return <ElementifyDeclarativeComponent key={keyPointer.getValue()} props={innerProps} />
          }
        })
      })
    },
  }),
})
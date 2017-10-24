import * as React from 'react'  // eslint-disable-line flowtype/require-valid-file-annotation
import * as D from '$shared/DataVerse'
import ElementifyDeclarativeComponent from './ElementifyDeclarativeComponent'
import type {Studio} from '$studio/handy'
import stringStartsWith from 'lodash/startsWith'

const identity = (a) => a

const getComponentDescriptorById = (id: D.IDerivation<string>, studio: D.IDerivation<$FixMe>): $FixMe =>
  D.derivations.withDeps({id, studio}, identity).flatMap(({id, studio}): $FixMe => {
    const idString = id.getValue()
    return stringStartsWith(idString, 'TheaterJS/Core/')
      ? studio.getValue().atom.pointer().prop('coreComponentDescriptorsById').prop(idString)
      : studio.getValue().atom.pointer().prop('state').prop('componentModel').prop('componentDescriptorsById').prop(idString)
  })

export const getAliasLessComponentDescriptor = (initialComponentId: D.IDerivation<string>, studio: D.IDerivation<Studio>): $FixMe => {
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

const elementify = (keyD, instantiationDescriptorP, studioD) => {
  const componentIdP = instantiationDescriptorP.prop('componentId')
  return getAliasLessComponentDescriptor(componentIdP, studioD).flatMap((componentDescriptor) => {
    if (!componentDescriptor) return D.derivations.autoDerive(() => {
      return <div>Cannot find component {componentIdP.getValue()}</div>
    })

    const componentDescriptorP = componentDescriptor.pointer()

    const componentDescriptorTypeP = componentDescriptorP.prop('type')
    return componentDescriptorTypeP.flatMap((type: string) => {
      if (type === 'HardCoded') {
        return elementifyHardCodedComponent(
          keyD, componentDescriptorP, instantiationDescriptorP.prop('props'), instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
        )
      } else {
        return elementifyDeclarativeComponent(
          keyD, componentDescriptorP, instantiationDescriptorP.prop('props'), instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
        )
      }
    })
  })
}

export default elementify

const elementifyHardCodedComponent = (keyD, componentDescriptorP, propsP, modifierInstantiationDescriptorsP) => {
  const reactComponentP = componentDescriptorP.prop('reactComponent')
  const componentIdD = componentDescriptorP.prop('id')
  const finalKeyD = D.derivations.autoDerive(() => {
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  return D.derivations.autoDerive(() => {
    const Comp = reactComponentP.getValue()
    return <Comp
      key={finalKeyD.getValue()}
      keyD={keyD}
      props={propsP}
      modifierInstantiationDescriptors={modifierInstantiationDescriptorsP}
    />
  })
}

const elementifyDeclarativeComponent = (keyD, componentDescriptorP, propsP, modifierInstantiationDescriptorsP) => {
  const componentIdD = componentDescriptorP.prop('id')
  const finalKeyD = D.derivations.autoDerive(() => {
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  const innerPropsP = D.atoms.dict({
    componentDescriptor: componentDescriptorP,
    props: propsP,
    modifierInstantiationDescriptors: modifierInstantiationDescriptorsP,
  }).derivedDict().pointer()

  return finalKeyD.flatMap((key) => {
    return <ElementifyDeclarativeComponent
      key={key}
      keyD={keyD}
      props={innerPropsP}
    />
  })
}
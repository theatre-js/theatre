import * as React from 'react'
import * as D from '$shared/DataVerse'
import ElementifyDeclarativeComponent from './ElementifyDeclarativeComponent'
import stringStartsWith from 'lodash/startsWith'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'

const identity = a => a

const getComponentDescriptorById = (
  idD: AbstractDerivation<string>,
  studioD: AbstractDerivation<$FixMe>,
): $FixMe =>
  D.derivations.withDeps({idD, studioD}, identity).flatMap((): $FixMe => {
    const idString = idD.getValue()

    const componentDescriptorsP = studioD
      .getValue()
      .atom.pointer()
      .prop('componentModel')
      .prop('componentDescriptors')

    return stringStartsWith(idString, 'TheaterJS/Core/')
      ? componentDescriptorsP.prop('core').prop(idString)
      : componentDescriptorsP.prop('custom').prop(idString)
  })

const elementify = (keyD, instantiationDescriptorP, studioD) => {
  const componentIdP = instantiationDescriptorP.prop('componentId')
  return getComponentDescriptorById(componentIdP, studioD).flatMap(
    (componentDescriptor: $FixMe) => {
      if (!componentDescriptor)
        return D.derivations.autoDerive(() => {
          return <div>Cannot find component {componentIdP.getValue()}</div>
        })

      const componentDescriptorP = componentDescriptor.pointer()
      const componentDescriptorTypeP = componentDescriptorP.prop('type')

      return componentDescriptorTypeP.flatMap((type: string) => {
        const fn =
          type === 'HardCoded'
            ? elementifyHardCodedComponent
            : elementifyDeclarativeComponent

        return fn(
          keyD,
          componentDescriptorP,
          instantiationDescriptorP.prop('props'),
          instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
        )
      })
    },
  )
}

export default elementify

const elementifyHardCodedComponent = (
  keyD: AbstractDerivation<string>,
  componentDescriptorP: $FixMe,
  propsP: $FixMe,
  modifierInstantiationDescriptorsP: $FixMe,
) => {
  const reactComponentP = componentDescriptorP.prop('reactComponent')
  const componentIdD = componentDescriptorP.prop('id')
  const finalKeyD = D.derivations.autoDerive(() => {
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  return D.derivations.autoDerive(() => {
    const Comp = reactComponentP.getValue()
    return (
      <Comp
        key={finalKeyD.getValue()}
        keyD={keyD}
        props={propsP}
        modifierInstantiationDescriptors={modifierInstantiationDescriptorsP}
      />
    )
  })
}

const elementifyDeclarativeComponent = (
  keyD: AbstractDerivation<string>,
  componentDescriptorP: $FixMe,
  propsP: $FixMe,
  modifierInstantiationDescriptorsP: $FixMe,
) => {
  const componentIdD = componentDescriptorP.prop('id')
  const finalKeyD = D.derivations.autoDerive(() => {
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  const innerPropsP = D.atoms
    .dict({
      componentDescriptor: componentDescriptorP,
      props: propsP,
      modifierInstantiationDescriptors: modifierInstantiationDescriptorsP,
    })
    .derivedDict()
    .pointer()

  return finalKeyD.flatMap(key => {
    return (
      <ElementifyDeclarativeComponent
        componentId={componentIdD.getValue()}
        key={key}
        keyD={keyD}
        props={innerPropsP}
      />
    )
  })
}

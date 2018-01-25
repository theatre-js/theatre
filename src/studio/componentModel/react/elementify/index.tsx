import * as React from 'react'
import * as D from '$shared/DataVerse'
import ElementifyDeclarativeComponent from './ElementifyDeclarativeComponent'
import {Studio} from '$studio/handy'
import stringStartsWith from 'lodash/startsWith'
import {AbstractDerivation} from '$src/shared/DataVerse/derivations/types'

const identity = a => a

const getComponentDescriptorById = (
  idD: AbstractDerivation<string>,
  studioD: AbstractDerivation<$FixMe>,
): $FixMe =>
  D.derivations
    .withDeps({idD, studioD}, identity)
    .flatMap(({idD, studioD}): $FixMe => {
      const idString = idD.getValue()
      return stringStartsWith(idString, 'TheaterJS/Core/')
        ? studioD
            .getValue()
            .atom.pointer()
            .prop('componentModel')
            .prop('componentDescriptors')
            .prop('core')
            .prop(idString)
        : studioD
            .getValue()
            .atom.pointer()
            .prop('componentModel')
            .prop('componentDescriptors')
            .prop('custom')
            .prop(idString)
    })

export const getAliasLessComponentDescriptor = (
  initialComponentIdD: AbstractDerivation<string>,
  studioD: AbstractDerivation<Studio>,
): $FixMe => {
  return getComponentDescriptorById(initialComponentIdD, studioD).flatMap(
    (des): $FixMe => {
      if (!des) return des

      return des
        .pointer()
        .prop('type')
        .flatMap(type => {
          if (type === 'Alias') {
            return des
              .pointer()
              .prop('aliasedComponentId')
              .flatMap(aliasedComponentId =>
                getAliasLessComponentDescriptor(
                  D.derivations.constant(aliasedComponentId),
                  studioD,
                ),
              )
          } else {
            return des
          }
        })
    },
  )
}

const elementify = (keyD, instantiationDescriptorP, studioD) => {
  const componentIdP = instantiationDescriptorP.prop('componentId')
  return getAliasLessComponentDescriptor(componentIdP, studioD).flatMap(
    (componentDescriptor: $FixMe) => {
      if (!componentDescriptor)
        return D.derivations.autoDerive(() => {
          return <div>Cannot find component {componentIdP.getValue()}</div>
        })

      const componentDescriptorP = componentDescriptor.pointer()

      const componentDescriptorTypeP = componentDescriptorP.prop('type')
      return componentDescriptorTypeP.flatMap((type: string) => {
        if (type === 'HardCoded') {
          return elementifyHardCodedComponent(
            keyD,
            componentDescriptorP,
            instantiationDescriptorP.prop('props'),
            instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
          )
        } else {
          return elementifyDeclarativeComponent(
            keyD,
            componentDescriptorP,
            instantiationDescriptorP.prop('props'),
            instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
          )
        }
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

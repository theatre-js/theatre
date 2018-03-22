import * as React from 'react'
import ElementifyDeclarativeComponent from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/ElementifyDeclarativeComponent'
import AbstractDerivation from '$src/shared/DataVerse/derivations/AbstractDerivation'
import withDeps from '$src/shared/DataVerse/derivations/withDeps'
import autoDerive from '$src/shared/DataVerse/derivations/autoDerive/autoDerive'
import dictAtom from '$src/shared/DataVerse/atoms/dict'
import {isCoreComponent} from '$studio/componentModel/selectors'

const identity = a => a

const getComponentDescriptorById = (
  idD: AbstractDerivation<string>,
  studioD: AbstractDerivation<$FixMe>,
): $FixMe =>
  withDeps({idD, studioD}, identity).flatMap((): $FixMe => {
    const idString = idD.getValue()

    const atomP = studioD.getValue().atom.pointer()

    const isCore = isCoreComponent(idString)

    return isCore
      ? atomP
          .prop('ahistoricComponentModel')
          .prop('coreComponentDescriptors')
          .prop(idString)
      : atomP
          .prop('historicComponentModel')
          .prop('customComponentDescriptors')
          .prop(idString)
  })

const elementify = (keyD, instantiationDescriptorP, studioD) => {
  const componentIdP = instantiationDescriptorP.prop('componentId')
  return getComponentDescriptorById(componentIdP, studioD).flatMap(
    (componentDescriptor: $FixMe) => {
      if (!componentDescriptor)
        return withDeps({componentIdP}, () => {
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
  const finalKeyD = withDeps({componentIdD, keyD}, () => {
    // debugger
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  return withDeps({reactComponentP, finalKeyD}, () => {
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
  const finalKeyD = autoDerive(() => {
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  const innerPropsP = dictAtom({
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

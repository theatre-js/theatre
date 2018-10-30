import React from 'react'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import {isCoreComponent} from '$theater/componentModel/selectors'
import getOrCreateClassForDeclarativeComponentId from './ElementifyDeclarativeComponent/getOrCreateClassForDeclarativeComponentId'
import constant from '$shared/DataVerse/derivations/constant'
import Theater from '$theater/bootstrap/Theater'

const identity = a => a

const getComponentDescriptorById = (
  idD: AbstractDerivation<string>,
  theaterD: AbstractDerivation<Theater>,
): $FixMe =>
  withDeps({idD, theaterD}, identity).flatMap(
    (): $FixMe => {
      const idString = idD.getValue()

      const atomP = theaterD.getValue().atom.pointer()

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
    },
  )

const elementify = (
  keyD,
  instantiationDescriptorP,
  theaterD: AbstractDerivation<Theater>,
) => {
  const componentIdP = instantiationDescriptorP.prop('componentId')
  return getComponentDescriptorById(componentIdP, theaterD).flatMap(
    (componentDescriptor: $FixMe) => {
      if (!componentDescriptor)
        return withDeps({componentIdP}, () => {
          return <div>Cannot find component {componentIdP.getValue()}</div>
        })

      const componentDescriptorP = componentDescriptor.pointer()
      const componentDescriptorTypeP = componentDescriptorP.prop('type')

      return componentDescriptorTypeP.flatMap((type: string) => {
        const reactComponentD =
          type === 'HardCoded'
            ? componentDescriptorP.prop('reactComponent')
            : constant(
                getOrCreateClassForDeclarativeComponentId(
                  componentIdP.getValue(),
                ),
              )

        return _elementify(
          keyD,
          // componentDescriptorP,
          componentIdP,
          reactComponentD,
          instantiationDescriptorP.prop('props'),
          instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
          instantiationDescriptorP.prop('owner'),
        )
      })
    },
  )
}

export default elementify

const _elementify = (
  keyD: AbstractDerivation<string>,
  componentIdD: AbstractDerivation<string>,
  reactComponentD: AbstractDerivation<React.ComponentType<$FixMe>>,
  // componentDescriptorP: $FixMe,
  propsP: $FixMe,
  modifierInstantiationDescriptorsP: $FixMe,
  ownerP: $FixMe,
) => {
  // const reactComponentD = componentDescriptorP.prop('reactComponent')
  // const componentIdD = componentDescriptorP.prop('id')
  const finalKeyD = withDeps({componentIdD, keyD}, () => {
    // debugger
    return `${componentIdD.getValue()}#${keyD.getValue()}`
  })

  return withDeps({reactComponentD, finalKeyD}, () => {
    const Comp = reactComponentD.getValue()
    return (
      <Comp
        key={finalKeyD.getValue()}
        keyD={keyD}
        props={propsP}
        modifierInstantiationDescriptors={modifierInstantiationDescriptorsP}
        owner={ownerP}
      />
    )
  })
}

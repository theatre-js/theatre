import React from 'react'
import AbstractDerivation from '$shared//DataVerse/derivations/AbstractDerivation'
import withDeps from '$shared/DataVerse/derivations/withDeps'
import {isCoreComponent} from '$studio/componentModel/selectors'
import getOrCreateClassForDeclarativeComponentId from './ElementifyDeclarativeComponent/getOrCreateClassForDeclarativeComponentId'
import constant from '$shared/DataVerse/derivations/constant';

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
        const reactComponentD =
          type === 'HardCoded'
            ? componentDescriptorP.prop('reactComponent')
            : constant(getOrCreateClassForDeclarativeComponentId(componentIdP.getValue()))

        return _elementify(
          keyD,
          // componentDescriptorP,
          componentIdP,
          reactComponentD,
          instantiationDescriptorP.prop('props'),
          instantiationDescriptorP.prop('modifierInstantiationDescriptors'),
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
      />
    )
  })
}

// const elementifyDeclarativeComponent = (
//   keyD: AbstractDerivation<string>,
//   componentDescriptorP: $FixMe,
//   propsP: $FixMe,
//   modifierInstantiationDescriptorsP: $FixMe,
// ) => {
//   const componentIdD = componentDescriptorP.prop('id')
//   const finalKeyD = autoDerive(() => {
//     return `${componentIdD.getValue()}#${keyD.getValue()}`
//   })

//   // const innerPropsP = dictAtom({
//   //   componentDescriptor: componentDescriptorP,
//   //   props: propsP,
//   //   modifierInstantiationDescriptors: modifierInstantiationDescriptorsP,
//   // })
//   //   .derivedDict()
//   //   .pointer()

//   return finalKeyD.flatMap(key => {
//     const Cls = getOrCreateClassForDeclarativeComponentId(
//       componentIdD.getValue(),
//     )

//     return (
//       <Cls
//         key={key}
//         keyD={keyD}
//         props={propsP}
//         modifierInstantiationDescriptors={modifierInstantiationDescriptorsP}
//       />
//     )

//     // return (
//     //   <ElementifyDeclarativeComponent
//     //     componentId={componentIdD.getValue()}
//     //     key={key}
//     //     keyD={keyD}
//     //     props={innerPropsP}
//     //   />
//     // )
//   })
// }

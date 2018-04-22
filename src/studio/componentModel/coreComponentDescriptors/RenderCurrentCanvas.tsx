// import {ComponentDescriptor} from '$studio/componentModel/types'
// import boxAtom from '$shared/DataVerse/atoms/boxAtom'
// import dictAtom from '$shared/DataVerse/atoms/dictAtom'
// import constant from '$shared/DataVerse/derivations/constant'
// import TheaterComponent from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
// import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
// import Studio from '$studio/bootstrap/Studio'
// import {val} from '$shared/DataVerse2/atom'
// import CurrentViewportCanvas from '$studio/viewports/CurrentViewportCanvas'
// import React from 'react'

// const componentId = 'TheaterJS/Core/RenderCurrentCanvas'

// class RenderCurrentCanvas extends TheaterComponent<$FixMe> {
//   static componentId = componentId
//   static componentType = 'HardCoded'
//   static displayName = 'RenderCurrentCanvas'

//   _getClass(baseClass) {
//     return baseClass.extend({
//       render(self) {
//         return self.prop('studioAtom').flatMap(studioAtom => {
//           return studioAtom
//             .pointer()
//             .prop('stateIsHydrated')
//             .flatMap((hydrated: boolean) => {
//               return hydrated
//                 ? RenderCurrentCanvas._render(studioAtom, self)
//                 : null
//             })
//         })
//       },
//     })
//   }

//   static _render(studioAtom: any, self: any) {
//     const childrenP = self
//       .pointer()
//       .prop('props')
//       .prop('children')
//     const studioP = self.prop('studio')
//     return autoDerive(() => {
//       const studio = studioP.getValue() as Studio
//       const whatToShowInBody = val(
//         studio.atom2.pointer.historicWorkspace.viewports.whatToShowInBody,
//       )
//       if (!whatToShowInBody || whatToShowInBody.type === 'Passthrough') {
//         return childrenP.getValue()
//       } else if (whatToShowInBody.type === 'ShowViewportCanvas') {
//         return <CurrentViewportCanvas />
//       } else {
//         return 'what to do?'
//       }
//     })
//     const componentIdToBeRenderedAsCurrentCanvasP = studioAtom
//       .pointer()
//       .prop('workspace')
//       .prop('componentIdToBeRenderedAsCurrentCanvas')

//     const instantiationDescriptorP = dictAtom({
//       componentId: boxAtom(componentIdToBeRenderedAsCurrentCanvasP),
//       props: dictAtom({}),
//     })
//       .derivedDict()
//       .pointer()

//     return componentIdToBeRenderedAsCurrentCanvasP.flatMap(C => {
//       if (typeof C === 'string') {
//         return elementify(
//           constant('currentCanvas'),
//           instantiationDescriptorP,
//           self.prop('studio'),
//         )
//       } else {
//         return childrenP.getValue()
//       }
//     })
//   }
// }

// const descriptor: ComponentDescriptor = {
//   id: componentId,
//   displayName: componentId,
//   type: 'HardCoded',
//   reactComponent: RenderCurrentCanvas,
// }

// export default descriptor

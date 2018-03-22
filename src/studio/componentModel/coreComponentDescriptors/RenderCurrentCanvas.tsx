import {ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent, elementify} from '$studio/handy'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import dictAtom from '$src/shared/DataVerse/atoms/dict'
import constant from '$src/shared/DataVerse/derivations/constant'

const componentId = 'TheaterJS/Core/RenderCurrentCanvas'

const RenderCurrentCanvas = makeReactiveComponent({
  componentId,
  componentType: 'HardCoded',
  displayName: 'RenderCurrentCanvas',
  getClass: baseClass =>
    baseClass.extend({
      render(self) {
        return self.prop('studioAtom').flatMap(studioAtom => {
          return studioAtom
            .pointer()
            .prop('stateIsHydrated')
            .flatMap((hydrated: boolean) => {
              return hydrated ? render(studioAtom, self) : null
            })
        })
      },
    }),
})

const descriptor: ComponentDescriptor = {
  id: componentId,
  displayName: componentId,
  type: 'HardCoded',
  reactComponent: RenderCurrentCanvas,
}

export default descriptor
function render(studioAtom: any, self: any) {
  const componentIdToBeRenderedAsCurrentCanvasP = studioAtom
    .pointer()
    .prop('workspace')
    .prop('componentIdToBeRenderedAsCurrentCanvas')
  const childrenP = self
    .pointer()
    .prop('props')
    .prop('children')
  const instantiationDescriptorP = dictAtom({
    componentId: boxAtom(componentIdToBeRenderedAsCurrentCanvasP),
    props: dictAtom({}),
  })
    .derivedDict()
    .pointer()
  return componentIdToBeRenderedAsCurrentCanvasP.flatMap(C => {
    if (typeof C === 'string') {
      return elementify(
        constant('currentCanvas'),
        instantiationDescriptorP,
        self.prop('studio'),
      )
    } else {
      return childrenP.getValue()
    }
  })
}

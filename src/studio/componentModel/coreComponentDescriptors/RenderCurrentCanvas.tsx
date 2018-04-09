import {ComponentDescriptor} from '$studio/componentModel/types'
import {elementify} from '$studio/handy'
import boxAtom from '$shared//DataVerse/atoms/boxAtom'
import dictAtom from '$shared//DataVerse/atoms/dictAtom'
import constant from '$shared//DataVerse/derivations/constant'
import TheaterComponent from '$studio/componentModel/react/TheaterComponent/TheaterComponent'

const componentId = 'TheaterJS/Core/RenderCurrentCanvas'

class RenderCurrentCanvas extends TheaterComponent<$FixMe> {
  static componentId = componentId
  static componentType = 'HardCoded'
  static displayName = 'RenderCurrentCanvas'
  
  _getClass(baseClass) {
    return baseClass.extend({
      render(self) {
        return self.prop('studioAtom').flatMap(studioAtom => {
          return studioAtom
            .pointer()
            .prop('stateIsHydrated')
            .flatMap((hydrated: boolean) => {
              return hydrated
                ? RenderCurrentCanvas._render(studioAtom, self)
                : null
            })
        })
      },
    })
  }

  static _render(studioAtom: any, self: any) {
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
}

const descriptor: ComponentDescriptor = {
  id: componentId,
  displayName: componentId,
  type: 'HardCoded',
  reactComponent: RenderCurrentCanvas,
}

export default descriptor

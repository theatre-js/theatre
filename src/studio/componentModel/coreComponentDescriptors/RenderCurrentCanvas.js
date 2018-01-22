// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent, elementify} from '$studio/handy'
import * as D from '$shared/DataVerse'

const componentId = 'TheaterJS/Core/RenderCurrentCanvas'

const RenderCurrentCanvas = makeReactiveComponent({
  componentId,
  componentType: 'HardCoded',
  displayName: 'RenderCurrentCanvas',
  modifyPrototypalDict: d =>
    d.extend({
      render(d) {
        return d.prop('studio').flatMap(studio => {
          const studioAtom = studio.atom

          const componentIdToBeRenderedAsCurrentCanvasPointer = studioAtom
            .pointer()
            .prop('workspace')
            .prop('componentIdToBeRenderedAsCurrentCanvas')
          const children = d
            .pointer()
            .prop('props')
            .prop('children')
          const instantiationDescriptorP = D.atoms
            .dict({
              componentId: D.atoms.box(
                componentIdToBeRenderedAsCurrentCanvasPointer,
              ),
              props: D.atoms.dict({}),
            })
            .derivedDict()
            .pointer()

          return componentIdToBeRenderedAsCurrentCanvasPointer.flatMap(C => {
            if (typeof C === 'string') {
              return elementify(
                D.derivations.constant('currentCanvas'),
                instantiationDescriptorP,
                d.prop('studio'),
              )
            } else {
              return children.getValue()
            }
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

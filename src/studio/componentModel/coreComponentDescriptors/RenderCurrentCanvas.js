// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent, Elementify} from '$studio/handy'
import * as React from 'react'
import * as D from '$shared/DataVerse'

const RenderCurrentCanvas = makeReactiveComponent({
  displayName: 'TheaterJS/Core/RenderCurrentCanvas',
  modifyPrototypalDict: (d) => d.extend({
    render(d) {
      const studioAtom = d.prop('studio').getValue().atom
      const componentIdToBeRenderedAsCurrentCanvasPointer = studioAtom.pointer().prop('state').prop('workspace').prop('componentIdToBeRenderedAsCurrentCanvas')
      const children = d.pointer().prop('props').prop('children')
      const props =D.atoms.dict({
        instantiationDescriptor:D.atoms.dict({
          componentId: D.atoms.box(componentIdToBeRenderedAsCurrentCanvasPointer),
          props:D.atoms.dict({}),
          modifierInstantiationDescriptors: D.atoms.dict({
            byId: D.atoms.dict({
            }),
            list: D.atoms.array([]),
          }),
        }),
      }).derivedDict().pointer()

      return D.derivations.autoDerive(() => {
        const C = componentIdToBeRenderedAsCurrentCanvasPointer.getValue()

        if (typeof C === 'string') {
          return <Elementify key="currentCanvas" props={props} />
        } else {
          return children.getValue()
        }
      })
    },
  }),
})

const {object, primitive} = D.literals

const descriptor: ComponentDescriptor = object({
  id: primitive('TheaterJS/Core/RenderCurrentCanvas'),
  type: primitive('HardCoded'),
  reactComponent: primitive(RenderCurrentCanvas),
})

export default descriptor
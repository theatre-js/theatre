// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent, Elementify} from '$studio/handy'
import * as React from 'react'
import * as D from '$shared/DataVerse'

const RenderCurrentCanvas = makeReactiveComponent({
  displayName: 'TheaterJS/Core/RenderCurrentCanvas',
  modifyBaseDerivation: (d) => d.extend({
    render(d) {
      const studioAtom = d.prop('studio').getValue().atom
      const componentIDToBeRenderedAsCurrentCanvasPointer = studioAtom.pointer().prop('state').prop('workspace').prop('componentIDToBeRenderedAsCurrentCanvas')
      const children = d.pointer().prop('props').prop('children')
      const props =D.atoms.dict({
        instantiationDescriptor:D.atoms.dict({
          componentID: D.atoms.box(componentIDToBeRenderedAsCurrentCanvasPointer),
          props:D.atoms.dict({}),
        }),
      }).derivedDict().pointer()

      return D.derivations.autoDerive(() => {
        const C = componentIDToBeRenderedAsCurrentCanvasPointer.getValue()

        if (typeof C === 'string') {
          return <Elementify key="currentCanvas" props={props} />
        } else {
          return children.getValue()
        }
      })
    },
  }),
})

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderCurrentCanvas',
  type: 'HardCoded',
  reactComponent: RenderCurrentCanvas,
}

export default descriptor
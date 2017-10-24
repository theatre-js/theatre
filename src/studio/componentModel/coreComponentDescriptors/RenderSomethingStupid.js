// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'

const componentId = 'TheaterJS/Core/RenderSomethingStupid'

const RenderSomethingStupid = makeReactiveComponent({
  displayName: componentId,
  componentType: 'HardCoded',
  componentId,
  modifyPrototypalDict: (d) => d.extend({
    render(d) {
      return d.pointer().prop('props').prop('foo').map((foo) => {
        console.log('foo is', foo)
        return <div key="blah">Im something stupid {foo}</div>
      })
    },
  }),
})

const descriptor: ComponentDescriptor = {
  id: componentId,
  type: 'HardCoded',
  reactComponent: RenderSomethingStupid,
}

export default descriptor
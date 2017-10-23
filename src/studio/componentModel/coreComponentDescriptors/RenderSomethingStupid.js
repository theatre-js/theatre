// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'
import * as D from '$shared/DataVerse'

const componentId = 'TheaterJS/Core/RenderSomethingStupid'

const RenderSomethingStupid = makeReactiveComponent({
  displayName: componentId,
  modifyPrototypalDict: (d) => d.extend({
    render(d) {
      return d.pointer().prop('props').prop('foo').map((foo) => {
        console.log('foo is', foo)
        return <div>I'm stupid {foo}</div>
      })
    },
  }),
})

const {object, primitive} = D.literals

const descriptor: ComponentDescriptor = object({
  id: primitive(componentId),
  type: primitive('HardCoded'),
  reactComponent: primitive(RenderSomethingStupid),
})

export default descriptor
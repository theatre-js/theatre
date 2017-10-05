// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'
// import * as D from '$shared/DataVerse'

const RenderSomethingStupid = makeReactiveComponent({
  displayName: 'TheaterJS/Core/RenderSomethingStupid',
  modifyBaseDerivation: (d) => d.extend({
    render(d) {
      return d.pointer().prop('props').prop('foo').map((foo) => {
        console.log('foo is', foo)
        return <div>I'm stupid {foo}</div>
      })
    },
  }),
})

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderSomethingStupid',
  type: 'HardCoded',
  reactComponent: RenderSomethingStupid,
}

export default descriptor
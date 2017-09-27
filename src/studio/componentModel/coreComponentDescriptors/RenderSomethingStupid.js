// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'
// import * as D from '$shared/DataVerse'

const RenderSomethingStupid = makeReactiveComponent({
  displayName: 'TheaterJS/Core/RenderSomethingStupid',
  modifyBaseDerivation: (d) => d.extend({
    render() {
      return <div>I'm stupid</div>
    },
  }),
})

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderSomethingStupid',
  type: 'HardCoded',
  reactComponent: RenderSomethingStupid,
}

export default descriptor
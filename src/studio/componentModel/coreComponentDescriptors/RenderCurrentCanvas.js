// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'

const RenderCurrentCanvas = makeReactiveComponent({
  modifyBaseDerivation: (d) => d.extend({
    render() {
      return <div>RenderCurrentCanvas here :D</div>
    },
  }),
})

const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/RenderCurrentCanvas',
  type: 'HardCoded',
  reactComponent: RenderCurrentCanvas,
}

export default descriptor

// import fakeDeclarativeButton from './fakeDeclarativeButton'
// export default fakeDeclarativeButton
//


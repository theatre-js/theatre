// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type ComponentInstantiationDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import {makeReactiveComponent} from '$studio/handy'

// type Props = {
//   // @todo use IReactive types instead
//   descriptor: $Call<typeof D.atomifyDeep, ComponentInstantiationDescriptor>,
// }

export default makeReactiveComponent({
  modifyBaseDerivation: (d) => d.extend({
    render(d) {
      return d.pointer().prop('props').prop('descriptor').map((v) => {
        return <div>ElementifyHardCodedComponent here :D</div>
      })
    },
  }),
})
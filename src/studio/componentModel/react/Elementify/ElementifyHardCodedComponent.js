// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import {type HardCodedComponentDescriptor} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import {makeReactiveComponent} from '$studio/handy'

type Props = {
  // @todo use IReactive types instead
  // descriptor: $Call<typeof D.atomifyDeep, HardCodedComponentDescriptor>,
}

export default makeReactiveComponent({
  displayName: 'HardCodedComponent',
  modifyPrototypalDict: (d) => d.extend({
    render(d) {
      const componentDescriptor = d.pointer().prop('props').prop('componentDescriptor')
      const reactComponentPointer = componentDescriptor.prop('reactComponent')
      const props = d.pointer().prop('props').prop('props')
      const modifierInstantiationDescriptors = d.pointer().prop('props').prop('modifierInstantiationDescriptors')

      const key = d.pointer().prop('key')

      return D.derivations.autoDerive(() => {
        const Comp = reactComponentPointer.getValue()
        return <Comp
          key={key.getValue()}
          props={props}
          modifierInstantiationDescriptors={modifierInstantiationDescriptors}
        />
      })
    },
  }),
})
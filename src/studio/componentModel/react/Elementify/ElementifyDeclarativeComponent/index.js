// @flow
import {type WhatToRender} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'
import {makeReactiveComponent} from '$studio/handy'
import resolveReferenceToHiddenLocalValue from './resolveReferenceToHiddenLocalValue'

export default makeReactiveComponent({
  modifyBaseDerivation: (d) => d.extend({
    render(d) {
      const componentDescriptorP = d.pointer().prop('props').prop('componentDescriptor')

      const whatToRenderP = componentDescriptorP.prop('whatToRender')

      return whatToRenderP.prop('type').flatMap((type: $ElementType<WhatToRender, 'type'>) => {
        if (type === 'ReferenceToLocalHiddenValue') {
          return resolveReferenceToHiddenLocalValue(whatToRenderP.prop('which'), d)
        } else {
          throw new Error(`Not implemented`)
        }
      })
    },
  }),
})
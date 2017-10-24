import {type WhatToRender} from '$studio/componentModel/types'  // eslint-disable-line flowtype/require-valid-file-annotation
import {makeReactiveComponent} from '$studio/handy'
import resolveReferenceToHiddenLocalValue from './resolveReferenceToHiddenLocalValue'

export default makeReactiveComponent({
  modifyPrototypalDict: (d) => d.extend({
    displayName(d) {
      return d.pointer().prop('componentId')
    },

    componentId(d) {
      return d.pointer().prop('props').prop('componentDescriptor').prop('id')
    },

    componentType() {
      return 'Declarative'
    },

    render(d) {
      const componentDescriptorP = d.pointer().prop('props').prop('componentDescriptor')

      const whatToRenderP = componentDescriptorP.prop('whatToRender')

      return whatToRenderP.prop('__descriptorType').flatMap((type: $ElementType<WhatToRender, 'type'>) => {
        if (type === 'ReferenceToLocalHiddenValue') {
          return resolveReferenceToHiddenLocalValue(whatToRenderP.prop('which'), d)
        } else {
          throw new Error(`Not implemented`)
        }
      })
    },
  }),
})
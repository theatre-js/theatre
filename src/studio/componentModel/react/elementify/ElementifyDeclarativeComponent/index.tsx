import {WhatToRender} from '$studio/componentModel/types' // eslint-disable-line flowtype/require-valid-file-annotation
import {makeReactiveComponent} from '$studio/handy'
import constructValue from './constructValue'

export default makeReactiveComponent({
  componentType: 'Declarative',
  getClass: d =>
    d.extend({
      // displayName(d) {
      //   return d.pointer().prop('componentId')
      // },

      // componentId(d) {
      //   return d
      //     .pointer()
      //     .prop('props')
      //     .prop('componentDescriptor')
      //     .prop('id')
      // },

      // componentType() {
      //   return 'Declarative'
      // },

      timelineDescriptors(d) {
        const componentDescriptorP = d
          .pointer()
          .prop('props')
          .prop('componentDescriptor')

        return componentDescriptorP.prop('timelineDescriptors').prop('byId')
      },

      render(self) {
        const componentDescriptorP = self
          .pointer()
          .prop('props')
          .prop('componentDescriptor')

        const whatToRenderP = componentDescriptorP.prop('whatToRender')
        return constructValue(whatToRenderP, self)

        // return whatToRenderP
        //   .prop('__descriptorType')
        //   .flatMap((type: $FixMe) => {
        //     if (type === 'ReferenceToLocalHiddenValue') {
        //       return constructValue(whatToRenderP, self)
        //     } else {
        //       throw new Error(
        //         `A declarative component's whatToRender should only be of type ReferenceToLocalHiddenValue.`,
        //       )
        //     }
        //   })
      },
    }),
})

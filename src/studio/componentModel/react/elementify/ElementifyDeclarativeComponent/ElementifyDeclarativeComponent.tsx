import {makeReactiveComponent} from '$src/studio/handy'
import constructValue from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructValue'

export default makeReactiveComponent({
  componentType: 'Declarative',
  componentId: 'ElementifyDeclarativeComponent',
  getClass: d =>
    d.extend({
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
      },
    }),
})

import {IModifierDescriptor} from '$studio/componentModel/types'
import commonStylesPrototype from '$src/studio/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/commonStylesPrototype'

const getClass = (propsP, dict) => {
  return dict.extend(commonStylesPrototype).extend({
    reifiedStyles(self) {
      return self.propFromSuper('reifiedStyles').flatMap(reifiedStyles => {
        console.log('were here!')

        return reifiedStyles
      })
    },
  })
}

const descriptor: IModifierDescriptor = {
  id: 'TheaterJS/Core/HTML/UberModifier',
  getClass,
}

export default descriptor

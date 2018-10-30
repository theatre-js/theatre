import {default as DOMTag, componentsForEachTag} from './DOMTag/DOMTag'

const coreComponentDescriptors = {
  'TheatreJS/Core/DOMTag': DOMTag,
  ...componentsForEachTag,
}

export default coreComponentDescriptors

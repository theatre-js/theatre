import {default as DOMTag, componentsForEachTag} from './DOMTag/DOMTag'

const coreComponentDescriptors = {
  'TheaterJS/Core/DOMTag': DOMTag,
  ...componentsForEachTag,
}

export default coreComponentDescriptors

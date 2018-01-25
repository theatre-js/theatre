// @flow
import RenderCurrentCanvas from './RenderCurrentCanvas'
import {default as DOMTag, componentsForEachTag} from './DOMTag'

const coreComponentDescriptors = {
  'TheaterJS/Core/RenderCurrentCanvas': RenderCurrentCanvas,
  'TheaterJS/Core/DOMTag': DOMTag,
  ...componentsForEachTag,
}

export default coreComponentDescriptors

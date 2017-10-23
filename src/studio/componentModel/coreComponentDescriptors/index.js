// @flow
import RenderCurrentCanvas from './RenderCurrentCanvas'
import RenderSomethingStupid from './RenderSomethingStupid'
import FakeDeclarativeButton from './FakeDeclarativeButton'
import DOMTag from './DOMTag'

const coreComponentDescriptors = {
  'TheaterJS/Core/RenderCurrentCanvas': RenderCurrentCanvas,
  'TheaterJS/Core/RenderSomethingStupid': RenderSomethingStupid,
  'TheaterJS/Core/FakeDeclarativeButton': FakeDeclarativeButton,
  'TheaterJS/Core/DOMTag': DOMTag,
}

export default coreComponentDescriptors
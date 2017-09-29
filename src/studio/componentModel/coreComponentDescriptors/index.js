// @flow
import RenderCurrentCanvas from './RenderCurrentCanvas'
import RenderSomethingStupid from './RenderSomethingStupid'
import FakeDeclarativeButton from './FakeDeclarativeButton'

const coreComponentDescriptors = {
  'TheaterJS/Core/RenderCurrentCanvas': RenderCurrentCanvas,
  'TheaterJS/Core/RenderSomethingStupid': RenderSomethingStupid,
  'TheaterJS/Core/FakeDeclarativeButton': FakeDeclarativeButton,
}

export default coreComponentDescriptors
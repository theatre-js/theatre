import state from './state.json'
import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const project = Theatre.getProject('bb 3', {state})
const timeline = project.getTimeline('Bounce')

const nativeObject = document.createElement('div')
nativeObject.style.cssText = `
    position: absolute;
    left: calc(10vw);
    bottom: 0;
    width: 50px;
    height: 50px;
    transform-origin: center bottom;
    background: #EEE;
  `
document.body.appendChild(nativeObject)

const object = timeline.getObject('The box', nativeObject, {
  props: {
    x: {
      type: 'number',
    },
    y: {
      type: 'number',
    },
  },
})

object.onValuesChange((newValues: $FixMe) => {
  // console.log(newValues)

  const div = object.nativeObject
  div.style.transform = `translateX(${-newValues.x}px) translateY(${-newValues.y}px)`
})

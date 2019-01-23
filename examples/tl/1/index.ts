import state from './state.json'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const project = Theatre.getProject("My project", {state})
const timeline = project.getTimeline("Bounce")

const nativeObject = document.createElement('div')
nativeObject.style.cssText = `
  position: absolute;
  left: 10vw;
  bottom: 0;
  width: 50px;
  height: 50px;
  transform-origin: center bottom;
  background: #EEE;
`
document.body.appendChild(nativeObject)

// Create an object:
const object = timeline.getObject(
  // The name of the object is "The box":
  "The box", 
  // Leave a reference to the native object, which in this case is a div:
  nativeObject,
  // Define the properties of our object. In this case, we plan to animate the object by 
  // moving it up and down, along the y axis. So we'll only have one prop for now:
  {
    props: {
      // Call the prop "y":
      y: {
        // And the type of our "y" prop is number:
        type: 'number'
      },
      stretch: {
      type: 'number'
    }
    }
  },
)

object.onValuesChange(newValues => {
  const div = object.nativeObject
    div.style.transform = `translateY(${- newValues.y}px) scaleY(${newValues.stretch}) scaleX(${1 / newValues.stretch})`
})

window.timeline = timeline
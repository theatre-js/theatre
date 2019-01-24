import state from './state.json'

import {TypeOfTheatre} from '$src/tl/entries/index'

declare var Theatre: TypeOfTheatre

const project = Theatre.getProject('My project', {state})

const createBox = (project, i) => {
  const nativeObject = document.createElement('div')
  nativeObject.style.cssText = `
    position: absolute;
    left: calc(10vw + ${i * 60}px);
    bottom: 0;
    width: 50px;
    height: 50px;
    transform-origin: center bottom;
    background: #EEE;
  `
  document.body.appendChild(nativeObject)

  const instanceName = 'Box ' + i
  const timeline = project.getTimeline('Bounce', instanceName)

  nativeObject.addEventListener('click', () => {
    timeline.play()
  })

  // Create an object:
  const object = timeline.getObject(
    // The name of the object is "The box":
    'The box',
    // Leave a reference to the native object, which in this case is a div:
    nativeObject,
    // Define the properties of our object. In this case, we plan to animate the object by
    // moving it up and down, along the y axis. So we'll only have one prop for now:
    {
      props: {
        // Call the prop "y":
        y: {
          // And the type of our "y" prop is number:
          type: 'number',
        },
        stretch: {
          type: 'number',
        },
      },
    },
  )

  object.onValuesChange(newValues => {
    const div = object.nativeObject
    div.style.transform = `translateY(${-newValues.y}px) scaleY(${
      newValues.stretch
    }) scaleX(${1 / newValues.stretch})`
  })
}

for (let i = 0; i < 3; i++) {
  createBox(project, i)
}

const project1 = Theatre.getProject('Project 1')
const project2 = Theatre.getProject('Project 2')

const timeline1 = project.getTimeline('Timeline 1')
const timeline2 = project.getTimeline('Timeline 2')

const confetti = project.getTimeline('Big Scene / Effects / Confetti')
const fireworks = project.getTimeline('Big Scene / Effects / Fireworks')

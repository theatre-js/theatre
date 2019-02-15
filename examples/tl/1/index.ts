// import Theatre from '../../../bundles/tl/core'
import state from './state.json'

// console.log(Theatre);
import {TypeOfTheatre} from '$src/tl/entries/index'
import TheatreJSProject from '../../../src/tl/facades/TheatreJSProject'

declare var Theatre: TypeOfTheatre

// Theatre.ui.hide()

const project = Theatre.getProject('My project', {state})

const natives: HTMLElement[] = []

const createBox = (project: TheatreJSProject, i: number, iteration: number) => {
  let nativeObject
  if (natives[i]) {
    nativeObject = natives[i]
  } else {
    nativeObject = document.createElement('div')
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
    natives[i] = nativeObject
  }

  const instanceName = 'Box ' + i
  const timeline = project.getTimeline('Bounce', instanceName)

  nativeObject.addEventListener('click', () => {
    timeline.play()
  })

  const propNames = [
    'y',
    'stretch' /*, 'inertia', 'lead', 'glide', 'torque', 'symbiosis', 'collision', 'slippage', 'elasticity', 'fuzz', 'friction '*/,
  ]

  // if (iteration === 1) {
  //   propNames.shift()
  //   propNames.push('one')
  // } else if (iteration === 2) {
  //   propNames.push('one', 'two')
  // } else if (iteration === 3) {
  //   propNames.push('two')
  // }

  const props: Record<string, {type: 'number'}> = {}
  propNames.forEach(name => {
    props[name] = {type: 'number'}
  })
  // debugger
  // Create an object:
  const object = timeline.getObject(
    // The name of the object is "The box":
    'The box',
    // Leave a reference to the native object, which in this case is a div:
    nativeObject,
    // Define the properties of our object. In this case, we plan to animate the object by
    // moving it up and down, along the y axis. So we'll only have one prop for now:
    {props},
  )

  // console.log({initial: object.currentValues})

  object.onValuesChange((newValues: $FixMe) => {
    // console.log(newValues)

    const div = object.nativeObject
    div.style.transform = `translateY(${-newValues.y}px) scaleY(${
      newValues.stretch
    }) scaleX(${1 / newValues.stretch})`
  })
}

// createBox(project, 0, 0)
;[0, 1, 2].forEach(iteration => {
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      createBox(project, i, iteration)
    }
  }, iteration * 1000)
})

// const project1 = Theatre.getProject('Project 1')
// const project2 = Theatre.getProject('Project 2')

// const timeline1 = project.getTimeline('Timeline 1')
// const timeline2 = project.getTimeline('Timeline 2')

// const confetti = project.getTimeline('Big Scene / Effects / Confetti')
// const fireworks = project.getTimeline('Big Scene / Effects / Fireworks')

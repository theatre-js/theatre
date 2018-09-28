import {TypeOfTheatre} from '$src/tl/entries/index'
import {NativeObjectType} from '$tl/objects/objectTypes'

declare var Theatre: TypeOfTheatre

const state = {
  revision: 'alohaa',
  definitionVersion: '0.1.0',
  projectState: {
    internalTimeines: {
      'Bouncing Ball / The ball': {
        objects: {
          'Act 1 / Stage / Ball': {
            props: {
              opacity: {
                valueContainer: {
                  type: 'StaticValueContainer',
                  value: 32,
                },
              },
            },
          },
        },
      },
    },
  },
}

const project = new Theatre.Project('Explorable Explanations')
project.getTimeline('Bouncing Ball / The ball', '1')
// project.getTimeline('Bouncing Ball / The ball', '2')
// project.getTimeline('Bouncing Ball X')
// project.getTimeline('Scene / Background / X / Y')
// project.getTimeline('Scene / Background')
// project.getTimeline('Scene / Foo / Foo')
// project.getTimeline('Scene / Foo / Bar')
// project.getTimeline('Scene / Foo / Baz')
// project.getTimeline('Scene / Foo / Bam')
// project.getTimeline('Scene / Bar')
// project.getTimeline('Scene / Baz')
// project.getTimeline('Scene / Demo / Cursor')
// project.getTimeline('Scene / Demo / Grids')
// project.getTimeline('Scene / Panels / Layers')
// project.getTimeline('Scene / Panels / Tools')

project.adapters.add(1, {
  accepts(nativeObject) {
    return nativeObject instanceof HTMLElement
  },

  getType(nativeObject: HTMLElement): NativeObjectType {
    return {
      props: {
        opacity: {
          type: 'number',
        },
        'position.x': {
          type: 'number',
        },
        'position.y': {
          type: 'number',
        },
      },
    }
  },

  start(obj, nativeObject: HTMLElement): VoidFn {
    // console.log('vv', nativeOb``);

    const stopListening = obj.onValuesChange((values, t) => {
      // console.log(nativeObject);
      // console.log(obj.path, t, values.opacity)

      nativeObject.style.opacity = String(values.opacity)
      nativeObject.style.transform = `translateX(${String(
        values['position.x'],
      )}px)`
    })

    const cleanup = () => {
      stopListening()
      nativeObject.style.opacity = '1'
    }

    return cleanup
  },
})

const timeline = project.getTimeline('Bouncing Ball / The ball')
const ballInDom = document.createElement('div')
document.body.appendChild(ballInDom)
ballInDom.style.cssText = `
  position: absolute; width: 50px;
  height: 50px; left: calc(50% - 25px);
  top: 10%; border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);`

ballInDom.classList.add('ball')
const ball = timeline.createObject('Act 1 / Stage / Ball', ballInDom)

timeline.createObject(
  'Act 1 / Stage / Ball / The dangling thing',
  document.createElement('div'),
)
timeline.createObject('Act 1 / Stage / Plane', document.createElement('div'))

timeline.createObject(
  'Act 1 / Helpers / FPS Counter',
  document.createElement('div'),
)

timeline.createObject('Act 2 / Recess / Title', document.createElement('div'))

timeline.createObject('Act 2 / Recess / Music', document.createElement('div'))

// import './tweenie'

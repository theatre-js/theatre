
export class Theater {
  constructor(
    readonly _theaterId: string,
    readonly savedData?: $IntentionalAny,
  ) {}

  getTimeline(timelineId: string, instanceId?: string) {
    return new TimelineInstance(this, timelineId, instanceId || 'default')
  }
}

export class TimelineInstance {
  constructor(
    readonly theater: Theater,
    readonly timelineId: string,
    readonly instanceId: string,
  ) {}

  getObject(name: string, nativeObject: $FixMe, config: $FixMe) {
    return new TimelineInstanceObject(this, name, nativeObject, config)
  }
}

class TimelineInstanceObject {
  constructor(
    readonly timeline: TimelineInstance,
    readonly name: string,
    readonly nativeObject: $FixMe,
    readonly config: $FixMe,
  ) {}

  onPropActivation(
    handler: (propName: string, timelineObject: this) => void,
    emitOnAlreadyActiveProps: boolean = true,
  ) {

  }

  getProp(name: string): TimelineInstanceObjectProp {
    return new TimelineInstanceObjectProp(this, name)
  }
}

class TimelineInstanceObjectProp {
  constructor(readonly timelineObject: TimelineInstanceObject, readonly name: string) {

  }

  onValueChange(listener: (newValue: $FixMe) => void): () => void {
    return null as $FixMe
  }

  onDeactivation(listener: () => void) {
    
  }
}

export const types: $FixMe = null


const types = t.types

describe(`TheaterJS Library`, () => {
  it(`should work adapter-less`, () => {
    const savedData = null
    const theater = new t.Theater('uniqueId', savedData)

    const timeline = theater.getTimeline('Effects / bouncing ball', 'first')
    const obj = {pos: {x: 0, y: 0, z: 0}}
    const animatedObj = timeline.getObject('The ball', obj, {
      props: {
        opacity: {
          name: 'opacity',
          type: types.number({
            limit: [0, 1],
          }),
        },
        pos: {
          name: 'position',
          type: types.record({
            x: types.number,
            y: types.number,
            z: types.number,
          }),
        },
      },
    })

    animatedObj.onPropActivation(function handleProp(name, animatedObj) {
      const prop = animatedObj.getProp(name)
      const unsubscribe = prop.onValueChange(value => {
        obj[name] = value
      })
      prop.onDeactivation(unsubscribe)
    })
  })

  it(`should work with dom wihtout adapter`, () => {
    const savedData = null
    const theater = new t.Theater('uniqueId', savedData)

    const timeline = theater.getTimeline('Effects / bouncing ball', 'first')
    const obj = document.createElement('div')
    const animatedObj = timeline.getObject('The ball', obj, {
      props: {
        position: {
          name: 'position',
          type: types.enum(['static', 'relative', 'absolute', 'fixed']),
          defaultValue: 'static',
          visibleByDefault: false,
        },
        pos: {
          name: 'position',
          type: types.record({
            x: types.number,
            y: types.number,
            z: types.number,
          }),
        },
      },
    })

    animatedObj.onPropActivation(function handleProp(name, animatedObj) {
      const prop = animatedObj.getProp(name)
      const unsubscribe = prop.onValueChange(value => {
        obj[name] = value
      })
      prop.onDeactivation(unsubscribe)
    })
  })
})

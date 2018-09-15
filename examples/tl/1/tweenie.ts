import timingFunction from 'timing-function'

/**
 * t is a fraction, usually between 0 and 1
 */
type TimingFunction = (t: number) => number

// const timingFunctions = {
//   test(t: number): number {
//     return (Math.pow(10, t) - 1) / 9
//   },

//   test2(t: number): number {
//     return Math.sin(Math.PI / 2 * t)
//   },
// }

class Timeline {
  startingTime: number

  constructor(
    readonly startingValue: number,
    readonly endingValue: number,
    readonly duration: number,
    readonly timingFunction: TimingFunction,
  ) {}

  start(startingTime: number) {
    this.startingTime = startingTime
  }

  getValueAt(currentTime: number) {
    const timeDiff = currentTime - this.startingTime
    const p = timeDiff / this.duration
    const progress = this.timingFunction(p > 1 ? 1 : p)
    const valuesDiff = this.endingValue - this.startingValue
    const value = progress * valuesDiff + this.startingValue
    return value
  }
}

class Transitioner {
  timeline: Timeline
  _ticking: boolean = false
  _lastValue: number

  constructor(
    readonly initialValue: number,
    readonly duration: number,
    readonly timingFunction: TimingFunction,
    readonly callback: (v: number) => void,
  ) {
    this.timeline = undefined as $IntentionalAny
    this._lastValue = initialValue
  }

  get value(): number {
    return this._lastValue
  }

  set value(val: number) {
    const newTimeline = new Timeline(
      this.value,
      val,
      this.duration,
      this.timingFunction,
    )
    newTimeline.start(performance.now())
    this.timeline = newTimeline
    this._startTicking()
  }

  _startTicking() {
    if (this._ticking) return
    requestAnimationFrame(this._tick)
  }

  _tick = (time: number) => {
    const ellapsedTime = time - this.timeline.startingTime
    // console.log({ellapsedTime});

    if (!(ellapsedTime > this.duration)) {
      requestAnimationFrame(this._tick)
    }

    const value = this.timeline.getValueAt(
      ellapsedTime > this.duration
        ? this.timeline.startingTime + this.duration
        : time,
    )
    this._lastValue = value
    this.callback(value)
  }
}

const div = document.createElement('div')
document.body.appendChild(div)
div.style.cssText = 'width: 100px; height: 100px; background: red;'

let width = 50
// const timeline = new Timeline(50, 100, 500, timingFunction.bounce.easeOut)
const transitioner = new Transitioner(
  50,
  500,
  timingFunction.bounce.easeOut,
  v => {
    // console.log({v});

    width = v
    redraw()
  },
)
window.t = transitioner
setTimeout(() => {
  // debugger
  transitioner.value = 200
}, 1000)
// timeline.start(performance.now())

function redraw() {
  div.style.width = width + 'px'
}

// const tick = (time: number) => {
//   // debugger
//   // debugger
//   width = transitioner.value
//   // width = tempWidth > 100 ? 100 : tempWidth
//   requestAnimationFrame(tick)
//   redraw()
// }

// requestAnimationFrame(tick)

// setTimeout(() => {
// width =
// }, 200)

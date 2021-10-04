import clamp from 'lodash-es/clamp'

type Op_Move = {
  type: 'Move'
  amount: number
  angle: number
  penDown: boolean
}

type Op_ModifyContext = {
  type: 'ContextModifier'
  fn: (ctx: CanvasRenderingContext2D) => void
}

type Op = Op_ModifyContext | Op_Move

type IPlan = {
  totalTravel: number
  ops: Op[]
}

export function makeTurtlePlan(fn: (turtle: Turtle) => void): IPlan {
  const plan: IPlan = {
    totalTravel: 0,
    ops: [],
  }

  const turtle = new Turtle(plan)
  fn(turtle)
  return plan
}

export function drawTurtlePlan(
  plan: IPlan,
  ctx: CanvasRenderingContext2D,
  {
    width,
    height,
    scale,
    startFrom,
  }: {
    width: number
    height: number
    scale: number
    startFrom: {x: number; y: number}
  },
  tilProgression: number,
): void {
  const {ops} = plan
  if (ops.length === 0) return

  const targetDistance = clamp(tilProgression, 0, 1) * plan.totalTravel

  ctx.clearRect(0, 0, width, height)

  let traveledSoFar = 0
  let pos = {...startFrom}
  ctx.beginPath()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'white'
  ctx.moveTo(pos.x, pos.y)

  for (const op of ops) {
    if (traveledSoFar >= targetDistance) return

    if (op.type === 'ContextModifier') {
      op.fn(ctx)
    } else {
      let amount = Math.abs(op.amount)
      const sign = op.amount < 0 ? -1 : 1
      const {angle} = op

      const roomTilTarget = targetDistance - traveledSoFar

      const distanceInThisStep = roomTilTarget < amount ? roomTilTarget : amount

      traveledSoFar += distanceInThisStep

      pos = move(pos, angle, distanceInThisStep * sign, scale, op.penDown, ctx)
      ctx.stroke()
    }
  }
}

function move(
  pointA: {x: number; y: number},
  _angle: number,
  amount: number,
  scale: number,
  penIsDown: boolean,
  ctx: CanvasRenderingContext2D,
): {x: number; y: number} {
  const angle = (_angle * Math.PI) / 180

  const unrotatedTarget = {
    x: pointA.x + amount * scale,
    y: pointA.y,
  }

  const pointB = {
    x:
      pointA.x +
      Math.cos(angle) * (unrotatedTarget.x - pointA.x) -
      Math.sin(angle) * (unrotatedTarget.y - pointA.y),
    y:
      pointA.y +
      Math.sin(angle) * (unrotatedTarget.x - pointA.x) -
      Math.sin(angle) * (unrotatedTarget.y - pointA.y),
  }

  if (penIsDown) {
    ctx.lineTo(pointB.x, pointB.y)
  } else {
    ctx.moveTo(pointB.x, pointB.y)
  }

  return pointB
}

class Turtle {
  private _state = {
    penIsDown: true,
    angle: -90,
  }

  constructor(private _plan: IPlan) {}

  fn = (innerFn: () => void) => {
    return innerFn
  }

  private _pushContextModifier(fn: (ctx: CanvasRenderingContext2D) => void) {
    this._plan.ops.push({type: 'ContextModifier', fn})
  }

  press = (n: number) => {
    this._pushContextModifier((ctx) => {
      ctx.lineWidth = n
    })
  }

  forward = (amount: number) => {
    this._plan.ops.push({
      type: 'Move',
      amount,
      penDown: this._state.penIsDown,
      angle: this._state.angle,
    })
    this._plan.totalTravel += Math.abs(amount)
    return this
  }

  backward = (amount: number) => {
    return this.forward(amount)
  }

  right = (deg: number) => {
    this._rotate(deg)
    return this
  }

  left = (deg: number) => {
    this._rotate(-deg)
    return this
  }

  private _rotate(deg: number) {
    this._state.angle += deg
  }

  penup = () => {
    this._state.penIsDown = false
    return this
  }

  pendown = () => {
    this._state.penIsDown = true
    return this
  }

  repeat = (n: number, fn: (i: number) => void) => {
    for (let i = 0; i < n; i++) {
      fn(i)
    }
    return this
  }
}

export type ITurtle = Turtle

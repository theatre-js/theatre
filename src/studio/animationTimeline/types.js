// @flow

export type PointPosition = {
  t: number,
  value: number,
}

export type PointHandles = [number, number, number, number]

export type PointConnectionStatus = boolean

export type Point = PointPosition & {
  handles: PointHandles,
  isConnected: PointConnectionStatus,
}

export type NormalizedPoint = Point & {
  _t: number,
  _value: number,
}

export type LaneID = string

export type AnimationTimelineNamespaceState = $FlowFixMe
// @flow
type UniqueID = string
export type VariableID = UniqueID
export type TimelineID = UniqueID
export type BoxID = UniqueID

export type PointPosition = {
  t: number
  value: number
}

export type PointHandles = [number, number, number, number]

export type PointConnectionStatus = boolean

export type Point = PointPosition & {
  handles: PointHandles
  isConnected: PointConnectionStatus
}

export type NormalizedPoint = Point & {
  _t: number
  _value: number
}

export type BoxObject = {
  id: BoxID
  height: number
  variables: VariableID[]
}

export type LayoutArray = BoxID[]
export type BoxesObject = {[id: BoxID]: BoxObject}
export type TimelineObject = {
  layout: LayoutArray
  boxes: BoxesObject
}

export type VariableObject = {
  id: VariableID
  extremums: [number, number]
  points: Point[]
  component: string
  property: string
}
export type Variables = {
  byId: {[id: VariableID]: VariableObject}
}

export type Timelines = {
  byId: {[id: TimelineID]: TimelineObject}
}

export type AnimationTimelineNamespaceState = {
  variables: Variables
  timelines: Timelines
}

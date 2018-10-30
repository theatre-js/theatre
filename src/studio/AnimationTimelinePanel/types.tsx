type UniqueID = string
export type VariableID = UniqueID
export type TimelineID = UniqueID
export type BoxID = UniqueID

export type PointPosition = {
  time: number
  value: number
}

export type PointHandles = [number, number, number, number]

export type PointConnectionStatus = boolean

export type TPoint = PointPosition & {
  interpolationDescriptor: {
    handles: PointHandles
    connected: PointConnectionStatus
    interpolationType: string
    __descriptorType: string
  }
}

export type TNormalizedPoint = TPoint & {
  _t: number
  _value: number
}

export type BoxObject = {
  id: BoxID
  height: number
  variables: VariableID[]
  activeVariable: VariableID
  dopeSheet: boolean
}

export type LayoutArray = BoxID[]
export type BoxesObject = {[id: string]: BoxObject}
export type TimelineObject = {
  layout: LayoutArray
  boxes: BoxesObject
  variables: Variables
}

export type VariableObject = {
  id: VariableID
  points: TPoint[]
  component: string
  property: string
  __descriptorType: string
}

export type Variables = {[id: string]: VariableObject}

export type Timelines = {
  byId: {[id: string]: TimelineObject}
}

export type TColor = {
  name: string
  normal: string
  darkened: string
}

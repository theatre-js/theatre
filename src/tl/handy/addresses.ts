export interface ProjectAddress {
  projectId: string
}

export interface TimelineAddress extends ProjectAddress {
  timelinePath: string
}

export interface TimelineInstanceAddress extends TimelineAddress {
  timelineInstanceId: string
}

export interface ObjectAddress extends TimelineAddress {
  objectPath: string
}

export interface PropAddress extends ObjectAddress {
  propKey: string
}

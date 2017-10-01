// @flow

export type Point = {
  t: number,
  value: number,
  handles: [number, number, number, number],
  isConnected: boolean,
}

export type AnimationTimelineNamespaceState = $FlowFixMe
import * as React from 'react'

/**
 * A superclass of almost all TheaterJS Studio components. Right now, it
 * doesn't do anything other than being a pure component, but we may add
 * features to it in the future, which will be available to all studio
 * components
 */
export default abstract class StudioComponent<
  Props,
  State
> extends React.PureComponent<Props, State> {}

// @flow
import makeReactiveComponent from '$studio/componentModel/react/makeReactiveComponent'
import {withStudio, type WithStudioProps as _WithStudioProps} from '$studio/componentModel/react/studioContext'
import typeSystem from '$studio/componentModel/typeSystem'
// import typeof {default as Studio} from '$studio/TheStudioClass'

export type {default as Studio} from '$studio/TheStudioClass'

export {
  withStudio,
  makeReactiveComponent,
  typeSystem,
}

export type WithStudioProps = _WithStudioProps
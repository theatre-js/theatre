// @flow
import propTypes from 'prop-types'
import getContext from 'recompose/getContext'
import withContext from 'recompose/withContext'
import withProps from 'recompose/withProps'
import compose from 'ramda/src/compose'
import {type HigherOrderComponent} from 'react-flow-types'
import TheStudioClass from '$studio/TheStudioClass'

export const contextName = 'theaterJSStudio'

export const contextTypes = {
  [contextName]: propTypes.any,
}

export const withStudio =
  (compose(
    withProps((ownProps) => ({studio: ownProps[contextName]})),
    getContext(contextTypes)
  ): HigherOrderComponent<{}, WithStudioProps>)

export const provideTheaterJSStudio = (theaterJSStudio: TheStudioClass) =>
  withContext(contextTypes, () => ({theaterJSStudio}))

export type WithStudioProps = {
  studio: TheStudioClass,
}
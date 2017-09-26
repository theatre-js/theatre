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
    getContext(contextTypes),
    withProps((ownProps) => ({studio: ownProps[contextName]})),
  ): HigherOrderComponent<{}, WithStudioProps>)

export const provideStudio = (theaterJSStudio: TheStudioClass) =>
  withContext(contextTypes, () => ({theaterJSStudio}))

export type WithStudioProps = {
  studio: TheStudioClass,
}
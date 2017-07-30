// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './PlaygroundPage.css'

type Props = {}

const PlaygroundPage = (props: Props) => {
  return (
    <div className={css.container}>playground here</div>
  )
}

export default compose(
  (a) => a
)(PlaygroundPage)
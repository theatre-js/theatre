// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './SamplePlayground.css'

const SamplePlayground = () => {
  return (
    <div className={css.container}>example playground here</div>
  )
}

export default compose(
  (a) => a
)(SamplePlayground)
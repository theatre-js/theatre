// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './SamplePlayground.css'

const SamplePlayground = () => {
  return (
    <div className={css.container}></div>
  )
}

export default compose(
  (a) => a
)(SamplePlayground)
// @flow
import * as React from 'react'
import compose from 'ramda/src/compose'
import css from './index.css'

// type Props = {}

const SplashScreen = () => {
  return (
    <div className={css.container}>
      Splash screen here
    </div>
  )
}

export default compose(
  (a) => a
)(SplashScreen)
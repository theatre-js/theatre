import * as React from 'react'
import {compose} from 'ramda'
import * as css from './PlaygroundPage.css'

const PlaygroundPage = () => {
  return <div className={css.container}>playground here</div>
}

export default compose(a => a)(PlaygroundPage)

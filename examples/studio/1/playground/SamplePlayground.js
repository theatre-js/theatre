// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './SamplePlayground.css'

type State = {
  showDiv: boolean,
}

class SamplePlayground extends React.Component<*, State> {
  constructor(props) {
    super(props)

    this.state = {
      showDiv: false,
    }
  }

  toggleDiv = () => {
    this.setState((state) => ({showDiv: !state.showDiv}))
  }

  render() {
    return (
      <div className={css.container}>
        <div>
          <div>first child</div>
          <div>second child</div>
        </div>
        <button onClick={this.toggleDiv}>toggle div</button>
        {this.state.showDiv && <div><div><div>div that toggles</div></div></div>}
      </div>
    )    
  }
}

export default compose(
  (a) => a
)(SamplePlayground)
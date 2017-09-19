// @flow
import React from 'react'
import css from './index.css'
import TimelineContainer from './TimelineContainer'

type Props = $FlowFixMe

type State = {
  timelines: {[id: string]: {name: string}},
}

class Content extends React.Component {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)

    this.state = {
      timelines: {
        '1': {name: 'a'},
        '2': {name: 'b'},
        '3': {name: 'c'},
      },
    }
  }

  render() {
    const {timelines} = this.state
    return (
      <div className={css.container}>
        {
          Object.keys(timelines).map((key) =>
            <TimelineContainer 
              key={key}
              name={timelines[key].name}/>
          )
        }
      </div>
    )
  }
}

export default Content
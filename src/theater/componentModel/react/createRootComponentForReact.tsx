import React from 'react'
import Theater from '$theater/bootstrap/Theater'
import {contextTypes, contextName} from './utils/studioContext'
import WhatToShowInBody from '$theater/workspace/components/WhatToShowInBody/WhatToShowInBody'

interface Props {
  children: React.ReactNode
}

const createRootComponentForReact = (theater: Theater) => {
  class TheaterJSRoot extends React.Component<
    Props,
    {WhatToShowInBody: typeof WhatToShowInBody}
  > {
    constructor(props: Props) {
      super(props)
      this.state = {WhatToShowInBody}

      if (process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept(
          '$theater/workspace/components/WhatToShowInBody/WhatToShowInBody',
          () => {
            this.setState({
              WhatToShowInBody: require('$theater/workspace/components/WhatToShowInBody/WhatToShowInBody')
                .default,
            })
          },
        )
      }
    }
    render() {
      const {WhatToShowInBody} = this.state
      return <WhatToShowInBody passThroughNode={this.props.children} />
    }

    getChildContext() {
      return {[contextName]: theater}
    }

    static childContextTypes = contextTypes
  }

  return TheaterJSRoot
}

export default createRootComponentForReact

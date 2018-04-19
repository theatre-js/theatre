import React from 'react'
import Studio from '$studio/bootstrap/Studio'
import {contextTypes, contextName} from './utils/studioContext'
import WhatToShowInBody from '$studio/workspace/components/WhatToShowInBody/WhatToShowInBody'

interface Props {
  children: React.ReactNode
}

const createRootComponentForReact = (studio: Studio) => {
  class TheaterJSRoot extends React.Component<
    Props,
    {WhatToShowInBody: typeof WhatToShowInBody}
  > {
    constructor(props: Props) {
      super(props)
      this.state = {WhatToShowInBody}

      if (process.env.NODE_ENV === 'development' && module.hot) {
        module.hot.accept(
          '$studio/workspace/components/WhatToShowInBody/WhatToShowInBody',
          () => {
            this.setState({
              WhatToShowInBody: require('$studio/workspace/components/WhatToShowInBody/WhatToShowInBody')
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
      return {[contextName]: studio}
    }

    static childContextTypes = contextTypes
  }

  return TheaterJSRoot
}

export default createRootComponentForReact

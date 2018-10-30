import React from 'react'
import Theatre from '$studio/bootstrap/Theatre'
import {
  contextTypes,
  contextName,
} from '$studio/componentModel/react/utils/studioContext'
import WhatToShowInBody from '$studio/workspace/components/WhatToShowInBody/WhatToShowInBody'
import {TickerProvider} from '$shared/utils/react/TickerContext'

interface Props {
  children: React.ReactNode
}

const createRootComponentForReact = (studio: Theatre) => {
  class TheaterJSRoot extends React.Component<
    Props,
    {WhatToShowInBody: typeof WhatToShowInBody}
  > {
    constructor(props: Props) {
      super(props)
      this.state = {WhatToShowInBody}

      if ($env.NODE_ENV === 'development' && module.hot) {
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
      return (
        <TickerProvider ticker={studio.ticker}>
          <WhatToShowInBody passThroughNode={this.props.children} />
        </TickerProvider>
      )
    }

    getChildContext() {
      return {[contextName]: studio}
    }

    static childContextTypes = contextTypes
  }

  return TheaterJSRoot
}

export default createRootComponentForReact

import React from 'react'
import propTypes from 'prop-types'
import UI from '$tl/ui/UI'

export default class UIComponent<
  Props,
  State
> extends React.PureComponent<Props, State> {
  ui: UI

  constructor(props: Props, context: $IntentionalAny) {
    super(props, context)
    this.ui = context.ui
  }

  static contextTypes = {
    ui: propTypes.any,
  }
}

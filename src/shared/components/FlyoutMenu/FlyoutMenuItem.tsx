import resolveCss from '$shared/utils/resolveCss'
import React from 'react'
import * as css from './FlyoutMenuItem.css'

interface IProps {
  css?: Partial<typeof css>
  onClick?: () => void
  hasSubMenu?: boolean // @todo
  title: string
}

interface IState {}

export default class FlyoutMenu extends React.PureComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    const {props} = this
    const classes = resolveCss(css, props.css)

    return (
      <div {...classes('container')} onClick={props.onClick}>
        {props.title}
      </div>
    )
  }
}

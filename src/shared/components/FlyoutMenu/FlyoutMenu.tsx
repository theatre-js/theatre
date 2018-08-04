import resolveCss from '$shared/utils/resolveCss'
import React from 'react'
import * as css from './FlyoutMenu.css'

interface IProps {
  css?: Partial<typeof css>
  onClose: () => void
}

interface IState {}

export default class FlyoutMenu extends React.PureComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  componentWillMount() {
    document.addEventListener('click', this.close)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.close)
  }

  close = () => {
    this.props.onClose()
  }

  render() {
    const classes = resolveCss(css, this.props.css)

    return (
      <div {...classes('positioner')}>
        <div {...classes('container')}>{this.props.children}</div>
      </div>
    )
  }
}

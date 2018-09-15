import React from 'react'
import css from './CopyableTextBlock.css'
import resolveCss from '$shared/utils/resolveCss'
import {copyToClipboard} from '$shared/utils/copyToClipboard'

const classes = resolveCss(css)

interface IProps {
  children: string
  expandToFit?: boolean
}

interface IState {
  copyingStatus: 'successful' | 'failed' | 'none'
}

class CopyableTextBlock extends React.PureComponent<IProps, IState> {
  textArea: React.RefObject<HTMLTextAreaElement> = React.createRef()

  constructor(props: IProps) {
    super(props)

    this.state = {
      copyingStatus: 'none',
    }
  }

  render() {
    const {copyingStatus} = this.state
    return (
      <div {...classes('container')}>
        <button {...classes('copyButton')} onClick={this.copyToClipboard}>
          Copy to clipboard
          <div
            {...classes('successful', copyingStatus === 'successful' && 'show')}
          >
            &#10004;
          </div>
          <div {...classes('failed', copyingStatus === 'failed' && 'show')}>
            &#10008;
          </div>
        </button>
        <textarea
          {...classes('textarea')}
          ref={this.textArea}
          value={this.props.children}
          disabled
        />
      </div>
    )
  }

  componentDidMount() {
    if (this.props.expandToFit) {
      this.textArea.current!.style.height = `${
        this.textArea.current!.scrollHeight
      }px`
    }
  }

  componentDidUpdate() {
    if (this.state.copyingStatus !== 'none') {
      setTimeout(() => {
        this.setState(() => ({copyingStatus: 'none'}))
      }, 1000)
    }
  }

  copyToClipboard = () => {
    copyToClipboard(this.props.children).then(successful => {
      this.setState(() => ({
        copyingStatus: successful ? 'successful' : 'failed',
      }))
    })
  }
}

export default CopyableTextBlock

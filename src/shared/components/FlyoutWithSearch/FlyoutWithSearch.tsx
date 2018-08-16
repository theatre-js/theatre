import React from 'react'
import css from './FlyoutWithSearch.css'
import {resolveCss} from '$shared/utils'
import noop from '$shared/utils/noop'
import Overlay from '$shared/components/Overlay/Overlay'

const classes = resolveCss(css)

interface IProps {
  onClickOutside: () => void
  onChange: (value: string) => void
  onBlur?: () => void
}

class FlyoutWithSearch extends React.PureComponent<IProps, {}> {
  static defaultProps = {
    onBlur: noop,
  }

  render() {
    const {onClickOutside, onChange, onBlur} = this.props
    return (
      <div {...classes('positioner')}>
        <div {...classes('container')}>
          <Overlay onClickOutside={onClickOutside}>
            <Overlay.Section>
              {this.props.children}
              <div {...classes('inputWrapper')}>
                <input
                  type="text"
                  {...classes('input')}
                  placeholder='Search'
                  autoFocus={true}
                  onBlur={onBlur}
                  onChange={e => onChange(e.target.value)}
                />
              </div>
            </Overlay.Section>
          </Overlay>
        </div>
      </div>
    )
  }
}

export default FlyoutWithSearch

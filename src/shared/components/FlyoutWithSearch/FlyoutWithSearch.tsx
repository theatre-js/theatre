import React from 'react'
import css from './FlyoutWithSearch.css'
import resolveCss from '$shared/utils/resolveCss'
import noop from '$shared/utils/noop'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'

const classes = resolveCss(css)

interface IProps {
  onClickOutside: () => void
  onChange: (value: string) => void
  onBlur?: () => void
  hideSearchBar?: boolean
  style?: React.CSSProperties
}

class FlyoutWithSearch extends React.PureComponent<IProps, {}> {
  static defaultProps = {
    onBlur: noop,
    hideSearchBar: false,
    style: null,
  }

  render() {
    const {onClickOutside, onChange, onBlur, hideSearchBar, style} = this.props
    return (
      <div {...classes('positioner')}>
        <div {...classes('container')} style={style}>
          <Overlay onClickOutside={onClickOutside}>
            <OverlaySection>
              {this.props.children}
              {!hideSearchBar && (
                <div {...classes('inputWrapper')}>
                  <input
                    type="text"
                    {...classes('input')}
                    placeholder="Search"
                    autoFocus={true}
                    onBlur={onBlur}
                    onChange={e => onChange(e.target.value)}
                  />
                </div>
              )}
            </OverlaySection>
          </Overlay>
        </div>
      </div>
    )
  }
}

export default FlyoutWithSearch

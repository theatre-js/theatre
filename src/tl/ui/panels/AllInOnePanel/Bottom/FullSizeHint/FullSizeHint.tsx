import React from 'react'
import css from './FullSizeHint.css'
import resolveCss from '$shared/utils/resolveCss'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {val} from '$shared/DataVerse/atom'

const classes = resolveCss(css)

interface IProps {
  children: React.ReactNode
}

export default class HintPop extends React.PureComponent<IProps, {}> {
  render() {
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer>
            {() => {
              const width = val(stuffP.width)
              const height = val(stuffP.heightMinusBottom)
              const style = {
                width,
                height,
              }
              return (
                <div {...classes('positioner')}>
                  <div {...classes('container')} style={style}>
                    <div {...classes('body')}>{this.props.children}</div>
                  </div>
                </div>
              )
            }}
          </PropsAsPointer>
        )}
      </AllInOnePanelStuff>
    )
  }
}

export const TextBlock = ({children}: IProps) => {
  return <p {...classes('text')}>{children}</p>
}

export const CodeSnippet = ({children}: IProps) => {
  return (
    <div {...classes('code')}>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  )
}

export const Tooltip = ({children}: IProps) => {
  return (
    <div {...classes('tooltipPositioner')}>
      <div {...classes('tooltipBg')}>
        <div {...classes('tooltipText')}>{children}</div>
      </div>
    </div>
  )
}

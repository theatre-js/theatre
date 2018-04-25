import resolveCss from '$shared/utils/resolveCss'
import * as css from './PanelTab.css'
import React from 'react'

type Props = {
  css?: Partial<typeof css>
  children: React.ReactNode
  isCurrent: boolean
  onClick?: () => void
}

const PanelTab = (props: Props) => {
  const classes = resolveCss(css, props.css as $IntentionalAny)

  return (
    <div
      onClick={props.onClick}
      {...classes('container', props.isCurrent && 'isCurrent')}
    >
      {props.children}
    </div>
  )
}

export default PanelTab

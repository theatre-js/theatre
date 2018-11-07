import React from 'react'
import * as css from './SvgIcon.css'
import resolveCss from '$shared/utils/resolveCss'

type Props = {
  css?: Partial<typeof css>
  src: string
  sizing?: 'em' | 'fill' | 'none' | 'absoluteFill'
}

const SvgIcon = (props: Props) => {
  const {src, css: propsCss, sizing, ...rest} = props
  const classes = resolveCss(css, propsCss as $IntentionalAny)

  return (
    <div
      {...classes('container', sizing || 'em')}
      {...rest}
      dangerouslySetInnerHTML={{__html: src}}
    />
  )
}

export default SvgIcon

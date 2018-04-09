import React from 'react'
import css from './SvgIcon.css'
import {resolveCss} from '$shared/utils'

type Props = {
  css?: any
  src: string
  sizing?: 'em' | 'fill' | 'none'
}

const SvgIcon = (props: Props) => {
  const {src, css: propsCss, sizing, ...rest} = props
  const classes = resolveCss(css, propsCss)

  return (
    <div
      {...classes('container', sizing || 'em')}
      {...rest}
      dangerouslySetInnerHTML={{__html: src}}
    />
  )
}

export default SvgIcon

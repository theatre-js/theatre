import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './BlockNonChrome.css'

// @ts-ignore ignore
const isChrome = !!window.chrome

interface IProps {
  css?: Partial<typeof css>
}

interface IState {}

const classes = resolveCss(css)

export default class BlockNonChrome extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return isChrome ? this.props.children : this.renderMessage()
  }

  renderMessage() {
    return (
      <>
        {this.props.children}
        <div {...classes('container')}>
          <div {...classes('message')}>
            <p>
              Hi! You're seeing{' '}
              <a href="https://theatrejs.com" target="_blank">
                Theatre.js
              </a>, a visual set of animation tools for the web.
            </p>
            <p>
              Your Theatre.js animation will run on all browsers. But to edit
              your animation, you need to use Chrome. This is temporary. 😊
              We're gonna support all browsers soon!
            </p>
          </div>
        </div>
      </>
    )
  }
}

// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import css from './NodeContent.css'
import * as _ from 'lodash'
import cx from 'classnames'

type Props = {
  type: 'tag' | 'text',
  content: string,
  updateText: Function,
  coreComponents: Ojbect,
}

type State = {
  isTagBeingChanged: boolean,
  left: number,
  width: number,
  top: number,
}

class NodeContent extends React.PureComponent<Props, State> {
  static defaultProps = {
    renderTags: true,
    type: 'tag',
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isTagBeingChanged: false,
      left: 0,
      width: 0,
      top: 0,
    }
  }

  showTagsList = () => {
    if (this.props.ignoreClick) return
    const {left, width, top} = this.container.getBoundingClientRect()
    this.setState(() => ({isTagBeingChanged: true, left, width, top}))
  }

  hideTagsList = () => {
    this.setState(() => ({isTagBeingChanged: false}))
  }

  changeComponentId = id => {
    const {nodePath, dispatch} = this.props
    dispatch(
      reduceStateAction(
        nodePath,
        node => {
          node.componentId = id
          return node
        },
      ),
    )
    this.hideTagsList()
  }

  render() {
    const {type, content, updateText, coreComponents, renderTags} = this.props
    const {isTagBeingChanged, left, width, top} = this.state
    return (
      <div className={css.container} ref={c => this.container = c}>
        {type === 'tag' ? ([
          <div
            key='content'
            className={cx(css.content, {[css.isHidden]: isTagBeingChanged})}
            onClick={this.showTagsList}>
            <span>&lt;</span>
            <span>{content}</span>
            <span>&gt;</span>
            <span>&nbsp;</span>
            <span>
              <i>class</i>
            </span>
          </div>,
          ...(renderTags ? [
            <div key='tags' className={cx(css.tagsWrapper, {[css.isVisible]: isTagBeingChanged})} onClick={this.hideTagsList}>
            <div
              className={cx(css.tagSelector, {[css.isVisible]: isTagBeingChanged})}
              style={{left, width, top}}>
                <div className={css.tagInput}><input placeholder={content} disabled={true}/></div>
                <div className={css.tagsList}>
                  {coreComponents
                  .map(c => (
                    <div
                      key={c.id}
                      className={css.tagBlock}
                      onClick={() => this.changeComponentId(c.id)}>
                        {c.displayName}
                      </div>
                  ))}
                </div>
              </div>
            </div>,
          ] : []),
        ]) : (
          <input value={content} onChange={e => updateText(e.target.value)} />
      )}
      </div>
    )
  }
}

export default connect(s => {
  const coreComponents = _.filter(_.get(s, ['componentModel', 'componentDescriptors', 'core']), c => (c.id !== 'TheaterJS/Core/RenderCurrentCanvas' && c.id !== 'TheaterJS/Core/DOMTag'))
  return {
    coreComponents,
  }
})(NodeContent)

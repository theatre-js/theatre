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

  showContextMenu = e => {
    e.stopPropagation()
    e.preventDefault()
    const {left, width, top} = this.container.getBoundingClientRect()
    this.setState(() => ({isContextMenuVisible: true, left, width, top}))
  }

  hideContextMenu = e => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    this.setState(() => ({isContextMenuVisible: false}))
  }

  changeComponentId = id => {
    const {nodePath, dispatch} = this.props
    dispatch(
      reduceStateAction(nodePath, node => {
        node.componentId = id
        return node
      }),
    )
    this.hideTagsList()
  }

  onDelete = () => {
    this.props.onDelete()
    this.hideContextMenu()
  }

  onAddText = () => {
    this.props.onAddText()
    this.hideContextMenu()
  }

  onDeleteText = () => {
    this.props.onDeleteText()
    this.hideContextMenu()
  }

  render() {
    const {
      type,
      content,
      updateText,
      coreComponents,
      renderTags,
      renderContextMenu,
    } = this.props
    const {isTagBeingChanged, isContextMenuVisible, left, width, top} = this.state
    return (
      <div className={css.container} ref={c => (this.container = c)}>
        {type === 'tag' ? (
          [
            <div
              key="content"
              className={cx(css.content, {
                [css.changeable]: renderTags,
                [css.isHidden]: isTagBeingChanged,
              })}
              onClick={this.showTagsList}
              onContextMenu={this.showContextMenu}
            >
              <span>&lt;</span>
              <span>{content}</span>
              <span>&gt;</span>
              <span>&nbsp;</span>
              <span>
                <i>class</i>
              </span>
            </div>,
            ...(renderContextMenu
              ? [
                  <div
                    key="context"
                    className={cx(css.modalWrapper, {
                      [css.isVisible]: isContextMenuVisible,
                    })}
                    onClick={this.hideContextMenu}
                    onContextMenu={this.hideContextMenu}
                  >
                    <div
                      className={cx(css.contextMenu, {
                        [css.isVisible]: isContextMenuVisible,
                      })}
                      style={{left, width, top}}
                      onClick={e => e.stopPropagation()}
                      onContextMenu={e => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                    >
                      <div
                        className={cx(css.contextMenuItem, {
                          [css.disabled]: !this.props.onAddText,
                        })}
                        onClick={this.onAddText}
                      >
                        Add text child
                      </div>
                      <div className={css.menuSeparator} />
                      <div
                        className={cx(css.contextMenuItem, {
                          [css.disabled]: !this.props.onDeleteText,
                        })}
                        onClick={this.onDeleteText}
                      >
                        Delete text child
                      </div>
                      <div className={css.menuSeparator} />
                      <div className={cx(css.contextMenuItem)} onClick={this.onDelete}>
                        Delete this node
                      </div>
                    </div>
                  </div>,
                ]
              : []),
            ...(renderTags
              ? [
                  <div
                    key="tags"
                    className={cx(css.modalWrapper, {[css.isVisible]: isTagBeingChanged})}
                    onClick={this.hideTagsList}
                  >
                    <div
                      className={cx(css.tagSelector, {
                        [css.isVisible]: isTagBeingChanged,
                      })}
                      style={{left, width, top}}
                    >
                      <div className={css.tagInput}>
                        <input placeholder={content} disabled={true} />
                      </div>
                      <div className={css.tagsList}>
                        {coreComponents.map(c => (
                          <div
                            key={c.id}
                            className={css.tagBlock}
                            onClick={() => this.changeComponentId(c.id)}
                          >
                            {c.displayName}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>,
                ]
              : []),
          ]
        ) : (
          <input value={content} onChange={e => updateText(e.target.value)} />
        )}
      </div>
    )
  }
}

export default connect(s => {
  const coreComponents = _.filter(
    _.get(s, ['componentModel', 'componentDescriptors', 'core']),
    c =>
      c.id !== 'TheaterJS/Core/RenderCurrentCanvas' && c.id !== 'TheaterJS/Core/DOMTag',
  )
  return {
    coreComponents,
  }
})(NodeContent)

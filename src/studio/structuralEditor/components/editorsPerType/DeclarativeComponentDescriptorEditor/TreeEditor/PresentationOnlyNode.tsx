import React from 'react'
import css from './PresentationOnlyNode.css'
import cx from 'classnames'
import {NODE_TYPE} from './constants'
import {NO_CLASS} from './ComponentNode'
import {fitInput} from './utils'

interface IProps {
  nodeData: $FixMe
  rootNodeId: string
}

interface IState {}

class PresentationOnlyNode extends React.PureComponent<IProps, IState> {
  displayNameInput: $FixMe
  classInput: $FixMe

  componentDidMount() {
    fitInput(this.displayNameInput)
    fitInput(this.classInput)
  }

  render() {
    const {nodeData: {children, ...nodeProps}, rootNodeId} = this.props
    return (
      <div
        className={cx(css.container, {
          [css.isDragHandle]: rootNodeId === nodeProps.id,
        })}
      >
        <div className={css.root}>
          {nodeProps.type === NODE_TYPE.COMPONENT && (
            <div className={css.componentNode}>
              <span className={css.tagOpen}>&lt;</span>
              <div className={css.displayName}>
                <input
                  ref={c => (this.displayNameInput = c)}
                  value={nodeProps.displayName}
                  onChange={() => {}}
                />
              </div>
              <span className={css.dot}>.</span>
              <div className={css.className}>
                <input
                  ref={c => (this.classInput = c)}
                  value={nodeProps.class || NO_CLASS}
                  onChange={() => {}}
                />
              </div>
              <span className={css.tagClose}>&gt;</span>
            </div>
          )}
          {nodeProps.type === NODE_TYPE.TEXT && (
            <div className={css.textNode}>
              <div className={css.textLogo}>t</div>
              <input
                className={css.textInput}
                value={nodeProps.value}
                onChange={() => {}}
              />
            </div>
          )}
        </div>
        {children &&
          children.map((child: $FixMe, index: number) => (
            <div className={css.childContainer} key={index}>
              <PresentationOnlyNode nodeData={child} rootNodeId={rootNodeId} />
            </div>
          ))}
      </div>
    )
  }
}

export default PresentationOnlyNode

// @flow
import {React} from '$studio/handy'
import css from './ComponentNode.css'
import {STATUS} from './constants'
import cx from 'classnames'
import TypeSelector from './TypeSelector'
import {fitInput} from './utils'

type Props = {
  nodeProps: $FixMe
  setAsComponentBeingSet: Function
  setClassValue: Function
  isSelected: boolean
}
type State = {
  isContentHidden: boolean
  classValue: string
  isTypeBeingChanged: boolean
}

const NO_CLASS = 'no class'

class ComponentNode extends React.PureComponent<Props, State> {
  state = {
    classValue: NO_CLASS,
    isContentHidden: false,
    isTypeBeingChanged: false,
  }

  componentDidMount() {
    this._setClassValueFromProps()

    if (this.props.nodeProps.status === STATUS.UNINITIALIZED) {
      this.setState(() => ({isTypeBeingChanged: true}))
      this._fitClassInput()
      this.width = this.container.getBoundingClientRect().width      
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.nodeProps.class !== this.props.nodeProps.class ||
      prevState.classValue !== this.state.classValue ||
      prevProps.isSelected !== this.props.isSelected
    ) {
      this._fitClassInput()
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // if (
    //   (nextProps.nodeProps.status === STATUS.CHANGED ||
    //     nextProps.nodeProps.status === STATUS.UNCHANGED) &&
    //   this.state.isContentHidden
    // ) {
    //   this.setState(() => ({isContentHidden: false}))
    // }
    if (
      (nextProps.nodeProps.status === STATUS.CHANGED ||
        nextProps.nodeProps.status === STATUS.UNCHANGED) &&
      this.state.isTypeBeingChanged
    ) {
      this.setState(() => ({isTypeBeingChanged: false}))
    }

    if (!nextProps.isSelected && this.state.isTypeBeingChanged) {
      this.setState(() => ({isTypeBeingChanged: false}))
    }
  }

  _fitClassInput() {
    if (this.classInput != null) fitInput(this.classInput)
  }

  _setClassValueFromProps() {
    const classValue = this.props.nodeProps.class
    if (classValue != null) this.setState(() => ({classValue: classValue || NO_CLASS}))
  }

  _focusOnClassInput = () => {
    this.classInput.focus()
    this.classInput.select()
  }

  handleClassValueChange = e => {
    fitInput(this.classInput)
    const {value} = e.target
    this.setState(() => ({classValue: value}))
  }

  handleKeyDown = e => {
    if (e.keyCode === 13) {
      this.classInput.blur()
      this.setClassValue()
    }
    if (e.keyCode === 27) {
      this.classInput.blur()
      this._setClassValueFromProps()
    }
    if (e.keyCode === 9) {
      e.preventDefault()
      this.classInput.blur()
      this.setClassValue()      
      this.setState(() => ({isTypeBeingChanged: true}))
    }
  }

  setClassValue = () => {
    if (this.state.classValue !== this.props.nodeProps.class) {
      this.props.setClassValue(this.state.classValue)
    }
  }

  handleClick = (e, target) => {
    e.stopPropagation()
    if (this.props.isSelected) {
      if (target === 'TYPE') {
        this.width = this.container.getBoundingClientRect().width
        this.setState(() => ({isTypeBeingChanged: true}))
      }
      // this.setState(() => ({isContentHidden: true}))
    } else {
      this.props.onSelect()
    }
  }

  onTypeChange = e => {
    const typeValue = e.target.value
    this.setState(() => ({typeValue}))
  }

  cancelSelectingType = () => {
    if (this.props.nodeProps.status === STATUS.UNINITIALIZED) {
      this.props.onCancelCreatingNode()
    }
  }

  render() {
    const {nodeProps, isSelected} = this.props
    const {isContentHidden, classValue, isTypeBeingChanged} = this.state
    return (
      <div
        ref={c => (this.container = c)}
        className={cx(css.container, {
          [css.isContentHidden]: isContentHidden,
        })}
        onMouseDown={e => {
          if (!e.shiftKey) e.stopPropagation()
        }}
        onClick={e => this.handleClick(e, 'CONTAINER')}
      >
        <div className={css.displayName} onClick={this.clickHandler}>
          <span className={cx(css.tagOpen, {[css.isSelected]: isSelected})}>
            &lt;
          </span>
          <TypeSelector
            onClick={e => this.handleClick(e, 'TYPE')}
            isActive={isTypeBeingChanged}
            initialValue={nodeProps.displayName}
            listOfDisplayNames={this.props.listOfDisplayNames}
            hasChildren={this.props.hasChildren}
            width={this.width}
            onSelect={this.props.onSelectComponentType}
            onCancel={this.cancelSelectingType}
            onTab={this._focusOnClassInput}
          />
          {((classValue !== NO_CLASS && !isSelected) || isSelected) && [
            <span key="dot" className={css.dot}>
              .
            </span>,
            <div key="classValue" className={css.className} onClick={e => this.handleClick(e, '')}>
              <input
                type="text"
                ref={c => (this.classInput = c)}
                className={cx(css.input, {[css.isDisabled]: !isSelected})}
                value={classValue}
                onChange={this.handleClassValueChange}
                onKeyDown={this.handleKeyDown}
                onFocus={() => this.classInput.select()}
              />
            </div>,
          ]}
          <span className={cx(css.tagClose, {[css.isSelected]: isSelected})}>
            &gt;
          </span>
        </div>
      </div>
    )
  }
}

export const presentationOnlyComponent = ({nodeProps}) => {
  return (
    <div className={css.container}>
      <div className={css.displayName}>{`<${nodeProps.displayName}>`}</div>
      <div className={css.className}>
        <input type="text" placeholder="Class" />
      </div>
    </div>
  )
}

export default ComponentNode

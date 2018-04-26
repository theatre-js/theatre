import {React} from '$studio/handy'

interface IProps {
  setRef?(instance: HTMLDivElement): void
  style: React.CSSProperties
  className: string
}

interface IState {}

class Section extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        ref={this.props.setRef}
      >
        {this.props.children}
      </div>
    )
  }
}

export default Section

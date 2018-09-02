import React from 'react'
import Modal from '$shared/components/Modal/Modal'
import CopyableTextBlock from '$shared/components/CopyableTextBlock/CopyableTextBlock'

interface IProps {
  onClose: () => void
}

interface IState {}

class ExportModal extends React.PureComponent<IProps, IState> {
  render() {
    return (
      <Modal onClose={this.props.onClose}>
        <p>Export JSON!</p>
        <CopyableTextBlock>{fakeJSON}</CopyableTextBlock>
      </Modal>
    )
  }
}

const fakeJSON = `
{
  a: {
    aa: 'aa',
    ab: 'ab',
    ac: 'ac'
  },
  b: {
    ba: 'ba',
    bb: 'bb'
  }
}
`

export default ExportModal

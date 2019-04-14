import React from 'react'
import Modal from '$shared/components/Modal/Modal'
import CopyableTextBlock from '$shared/components/CopyableTextBlock/CopyableTextBlock'
import Project from '$tl/Project/Project'
import * as css from './ExportModal.css'
import {escape} from 'lodash-es'
// import {isMac} from '$shared/utils/isMac'
import SyntaxHighlightedCode from '$shared/components/SyntaxHighlightedCode'

interface IProps {
  onClose: () => void
  exportString: string
  project: Project
}

interface IState {}

class ExportModal extends React.PureComponent<IProps, IState> {
  render() {
    const sampleCode = makeSampleCode(
      this.props.project.id,
      `replace {} with the json object you just copied`,
    )
    return (
      <Modal
        onClose={this.props.onClose}
        container={document.getElementById('theatrejs-ui-root')!}
      >
        <div className={css.container}>
          <p>Copy and paste the following json object into your source file:</p>
          <CopyableTextBlock>{this.props.exportString}</CopyableTextBlock>
          <p>This is where the json object should be pasted:</p>
          <SyntaxHighlightedCode code={sampleCode} />
          {/* <p className={css.hint}>
            Hint: {isMac ? 'Option' : 'Alt'}+click on the export
            button to skip opening this dialog
          </p> */}
        </div>
      </Modal>
    )
  }
}

export const makeSampleCode = (projectId: string, comment: string) => {
  return `
    <div><span style=\"color: #c792ea;\">const</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #f07178;\">state</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #c792ea;\">=</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #89ddff;\">{}</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #546e7a;font-style: italic;\">// ${comment}</span></div><div><span style=\"color: #c792ea;\">const</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #f07178;\">project</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #c792ea;\">=</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #c792ea;\">new</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #ffcb6b;\">Project</span><span style=\"color: #eeffff;\">(</span><span style=\"color: #89ddff;\">\"</span><span style=\"color: #c3e88d;\">${escape(
    projectId,
  )}</span><span style=\"color: #89ddff;\">\"</span><span style=\"color: #89ddff;\">,</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #89ddff;\">{</span><span style=\"color: #eeffff;\">state</span><span style=\"color: #89ddff;\">:</span><span style=\"color: #eeffff;\"> </span><span style=\"color: #eeffff;\">state</span><span style=\"color: #89ddff;\">}</span><span style=\"color: #eeffff;\">)</span></div>
    `
}

export default ExportModal

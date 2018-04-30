import Panel from '$theater/workspace/components/Panel/Panel'
import PropsAsPointer from '../handy/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import React from 'react'
import {renderEditorForEitherLeftOrRightPanel} from '$theater/LeftPanel/LeftPanel'

type IProps = {}

interface IState {}

export default class RightPanel extends React.PureComponent<IProps, IState> {
  static panelName = 'Right'
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {(_: Pointer<IProps>, theater) => {
          return (
            <Panel label="Element">
              {renderEditorForEitherLeftOrRightPanel('right', theater)}
            </Panel>
          )
        }}
      </PropsAsPointer>
    )
  }
}

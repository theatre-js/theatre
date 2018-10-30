import Panel from '$studio/workspace/components/Panel/Panel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {Pointer} from '$shared/DataVerse2/pointer'
import React from 'react'
import {renderEditorForEitherLeftOrRightPanel} from '$studio/LeftPanel/LeftPanel'
import {TheaterConsumer} from '$studio/componentModel/react/utils/studioContext'

type IProps = {}

interface IState {}

export default class RightPanel extends React.PureComponent<IProps, IState> {
  static panelName = 'Right'
  render() {
    return (
      <TheaterConsumer>
        {studio => (
          <PropsAsPointer props={this.props}>
            {() => {
              return (
                <Panel label="Element">
                  {renderEditorForEitherLeftOrRightPanel('right', studio)}
                </Panel>
              )
            }}
          </PropsAsPointer>
        )}
      </TheaterConsumer>
    )
  }
}

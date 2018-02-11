import {CommonNamespaceState} from '$studio/common/types'
import {WorkspaceNamespaceState} from '$studio/workspace/types'
import {IComponentModelNamespaceState} from '$studio/componentModel/types'
import React from 'react'

export interface IStoreState {
  common: CommonNamespaceState
  workspace: WorkspaceNamespaceState
  componentModel: IComponentModelNamespaceState
}

export type Selector<ReturnType, ParamsType> = (
  state: IStoreState,
  params: ParamsType,
) => ReturnType

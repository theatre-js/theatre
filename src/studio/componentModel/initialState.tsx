import {
  IComponentModelNamespaceHistoricState,
  IComponentModelNamespaceAhistoricState,
} from './types'
import coreComponentDescriptors from './coreComponentDescriptors/coreComponentDescriptors'
import coreModifierDescriptors from './coreModifierDescriptors/coreModifierDescriptors'

import tempCustomComponentDescriptors from './tempBall2'

export const historicInitialState: IComponentModelNamespaceHistoricState = {
  customComponentDescriptors: tempCustomComponentDescriptors,
}

export const ahistoricInitialState: IComponentModelNamespaceAhistoricState = {
  coreComponentDescriptors,
  coreModifierDescriptors,
  collapsedElementsByVolatileId: {},
}

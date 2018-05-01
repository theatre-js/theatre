import {IDeclarativeComponentDescriptor} from './types/declarative'
import uuid from 'uuid/v4'

export const makeSceneComponent = (
  overrides: Partial<IDeclarativeComponentDescriptor>,
): IDeclarativeComponentDescriptor => {
  return {
    isScene: true,
    __descriptorType: 'DeclarativeComponentDescriptor',
    displayName: 'NewComponent',
    id: uuid(),
    timelineDescriptors: {
      list: [],
      byId: {},
    },
    localHiddenValuesById: {
      first: null,
    },
    whatToRender: {
      __descriptorType: 'ReferenceToLocalHiddenValue',
      which: 'first',
    },
    ...overrides,
  }
}

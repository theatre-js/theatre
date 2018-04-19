import Studio from './Studio'
import MirrorOfReactTree, {
  VolatileId,
} from '$studio/integrations/react/treeMirroring/MirrorOfReactTree'

export default class ElementTree {
  mirrorOfReactTree: MirrorOfReactTree
  registeredComponentsByType: {
    unexpandedViewports: Record<string, VolatileId>
    expandedViewports: Record<string, VolatileId>
  }
  constructor(readonly _studio: Studio) {
    this.mirrorOfReactTree = new MirrorOfReactTree()
    this.registeredComponentsByType = {
      unexpandedViewports: {},
      expandedViewports: {},
    }
  }

  registerUnexpandedViewport() {

  }

  unregisterUnexpandedViewport() {
    
  }
}

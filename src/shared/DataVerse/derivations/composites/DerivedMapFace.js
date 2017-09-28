// @flow
/*::import type {default as DerivedMap} from './DerivedMap' */
import Emitter from '$shared/DataVerse/utils/Emitter'
// import DerivationOfAPropOfADerivedMap from './DerivationOfAPropOfADerivedMap'
import Context from '$shared/DataVerse/Context'
import type {MapKey} from '$shared/DataVerse/types'
import Derivation from '../Derivation'
import DerivationOfAPropOfADerivedMapFace from './DerivationOfAPropOfADerivedMapFace'
import ConstantDerivation from '../ConstantDerivation'
// import StabilizedDerivation from './StabilizedDerivation'
import forEach from 'lodash/forEach'
import PointerDerivation from '../PointerDerivation'

const NOTFOUND = Symbol('notfound')
const notFoundDerivation = new ConstantDerivation(NOTFOUND)

type Wire = {
  key: MapKey,
  startsInLayer: LayerID,
  endsInLayerId: LayerID,
  proxyDerivation: DerivationOfAPropOfADerivedMapFace<$FixMe>,
}

export type LayerID = 'face' | 'tail' | number

type Layer = {
  id: number,
  initiatingWiresByKey: {[propName: MapKey]: Wire},
  derivedMap: DerivedMap<$FixMe>,
  sourceDerivationsByKey: {[propName: MapKey]: Derivation<$FixMe>},
  untapFromParentChanges: () => void,
}

type Layers = {
  byId: {[id: LayerID]: Layer},
  list: Array<number>,
  face: {initiatingWiresByKey: {[propName: MapKey]: Wire}},
  tail: {sourceDerivationsByKey: {[propName: MapKey]: Derivation<$FixMe>}},
}

type Structure = {
  layers: Layers,
  derivationsByLayerAndKey: {[lk: string]: Derivation<$FixMe>},
}

const makeEmptyStructure = (): Structure => ({
  layers: {
    byId: {},
    list: [],
    face: {initiatingWiresByKey: {}},
    tail: {sourceDerivationsByKey: {}},
  },
  derivationsByLayerAndKey: {},
})

export default class DerivedMapFace {
  _head: DerivedMap<$FixMe>
  _changeEmitter: Emitter<$FixMe>
  _dataVerseContext: Context
  _structure: Structure
  _updateStructure: () => void

  constructor(head: DerivedMap<$FixMe>, context: Context) {
    this._head = head
    this._changeEmitter = new Emitter
    this._dataVerseContext = context
    this._structure = makeEmptyStructure()
    this._updateStructure = this._updateStructure.bind(this)
    this._updateStructure()
  }

  setHead(head: DerivedMap<$FixMe>) {
    this._head = head
    this._updateStructure()
  }

  _notifyStructureNeedsUpdating = () => {
    this._dataVerseContext.addObjectWhoseStructureShouldBeUpdated(this)
  }

  _updateStructure() {
    const oldStructure = this._structure
    forEach(oldStructure.layers.byId, (layer) => {
      layer.untapFromParentChanges()
    })

    const newStructure = makeEmptyStructure()

    let currentDerivedMap = this._head
    while (true) { // eslint-disable-line no-constant-condition
      if (!currentDerivedMap) break

      const id = currentDerivedMap._id
      const layer = {
        id,
        initiatingWiresByKey: {},
        derivedMap: currentDerivedMap,
        sourceDerivationsByKey: {},
        untapFromParentChanges: currentDerivedMap.parentChanges().tap(this._notifyStructureNeedsUpdating),
      }
      newStructure.layers.list.unshift(id)
      newStructure.layers.byId[id] = layer

      currentDerivedMap = currentDerivedMap.getParent()
    }

    // dragons

    this._structure = newStructure
  }

  changes() {
    return this._changeEmitter
  }

  pointer() {
    return new PointerDerivation({root: this, path: []})
  }

  prop(key: MapKey): $FixMe {
    return this.propFromLayer(key, 'face')
  }

  propFromLayer(key: MapKey, initiatingLayerId: 'face' | number): Derivation<$FixMe> {
    const layer = initiatingLayerId === 'face' ? this._structure.layers.face : this._structure.layers.byId[initiatingLayerId]
    if (!layer)
      throw new Error(`Layer ${initiatingLayerId} doesn't exist. This should never happen`)

    const possibleWireInLayer = layer.initiatingWiresByKey[key]
    if (possibleWireInLayer) {
      return possibleWireInLayer.proxyDerivation
    }

    return this._createWire(key, initiatingLayerId).proxyDerivation
  }

  _createWire(key: MapKey, startsInLayer: 'face' | number): Wire {
    const endsInLayerId = this._findALayerThatHasProp(key, startsInLayer)

    const sourceDerivation = this._makeSourceDerivation(key, endsInLayerId)
    const proxyDerivation = new DerivationOfAPropOfADerivedMapFace(sourceDerivation)
    const wire =  {key, startsInLayer, endsInLayerId, proxyDerivation}

    const layer = startsInLayer === 'face' ? this._structure.layers.face : this._structure.layers.byId[startsInLayer]
    layer.initiatingWiresByKey[key] = wire
    return wire
  }

  _makeSourceDerivation(key: MapKey, layerId: 'tail' | number): Derivation<$FixMe> {
    // if (layerId === 'tail')  return notFoundDerivation
    const layer = layerId === 'tail' ? this._structure.layers.tail : this._structure.layers.byId[layerId]
    const possibleSourceDerivation = layer.sourceDerivationsByKey[key]

    if (possibleSourceDerivation) return possibleSourceDerivation

    let derivation
    if (layerId === 'tail') {
      derivation = notFoundDerivation
    } else {
      const lid = layerId
      const constructor = (layer: $FixMe).derivedMap._getConstructor(key)
      derivation = notFoundDerivation.flatMap(() => constructor(new ConstructorArg(this, lid)))
    }

    layer.sourceDerivationsByKey[key] = derivation
    return derivation
  }

  _findALayerThatHasProp(key: MapKey, above: 'face' | number): number | 'tail' {
    const startingIndex = above === 'face' ? this._structure.layers.list.length - 1 : this._structure.layers.list.indexOf(above) - 1
    if (startingIndex < 0) return 'tail'

    for (let i = startingIndex; i >= 0; i--) {
      const layerId = this._structure.layers.list[i]

      const layer: Layer = (this._structure.layers.byId[layerId]: $FixMe)
      const derivedMap = layer.derivedMap
      const constructor = derivedMap._getConstructor(key)
      if (constructor) {
        return layerId
      }
    }

    return 'tail'
  }

}

class ConstructorArg {
  _front: *
  _sourceLayerId: number
  constructor(front: DerivedMapFace, sourceLayerId: number) {
    this._front = front
    this._sourceLayerId = sourceLayerId
  }

  prop(key: MapKey) {
    return this._front.prop(key)
  }

  pointer() {
    return this._front.pointer()
  }

  propFromAbove(key) {
    return this._front.propFromLayer(key, this._sourceLayerId)
  }
}

export type Face = DerivedMapFace

// @flow
import type {IPrototypalDict} from './PrototypalDict'
import Emitter from '$shared/DataVerse/utils/Emitter'
// import DerivationOfAPropOfADerivedDict from './DerivationOfAPropOfADerivedDict'
import Context from '$shared/DataVerse/Context'
import type {MapKey} from '$shared/DataVerse/types'
import type {IDerivation} from '../types'
import {type IDerivationOfAPropOfPrototypalDictFace, default as propOfPrototypalDictFace} from './propOfPrototypalDictFace'
import constant from '../constant'
// import StabilizedDerivation from './StabilizedDerivation'
import forEach from 'lodash/forEach'
import pointer from '../pointer'

const NOTFOUND = undefined // Symbol('notfound')
const notFoundDerivation = constant(NOTFOUND)

type Wire = {
  key: MapKey,
  startsInLayer: LayerId,
  endsInLayerId: LayerId,
  proxyDerivation: IDerivationOfAPropOfPrototypalDictFace<$FixMe>,
}

export type LayerId = 'face' | 'tail' | number

type Layer = {
  id: number,
  initiatingWiresByKey: {[propName: MapKey]: Wire},
  derivedDict: IPrototypalDict<$FixMe>,
  sourceDerivationsByKey: {[propName: MapKey]: IDerivation<$FixMe>},
  untapFromParentChanges: () => void,
}

type Layers = {
  byId: {[id: LayerId]: Layer},
  list: Array<number>,
  face: {initiatingWiresByKey: {[propName: MapKey]: Wire}},
  tail: {sourceDerivationsByKey: {[propName: MapKey]: IDerivation<$FixMe>}},
}

type Structure = {
  layers: Layers,
  derivationsByLayerAndKey: {[lk: string]: IDerivation<$FixMe>},
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

export default class DerivedDictFace {
  _head: ?IPrototypalDict<$FixMe>
  _changeEmitter: Emitter<$FixMe>
  _dataVerseContext: Context
  _structure: Structure
  _updateStructure: () => void

  constructor(head: ?IPrototypalDict<$FixMe>, context: Context) {
    this._head = head
    this._changeEmitter = new Emitter
    this._dataVerseContext = context
    this._structure = makeEmptyStructure()
    this._updateStructure = this._updateStructure.bind(this)
    this._updateStructure()
  }

  setHead(head: ?IPrototypalDict<$FixMe>) {
    this._head = head
    this._notifyStructureNeedsUpdating()
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

    let currentDerivedDict = this._head
    while (true) { // eslint-disable-line no-constant-condition
      if (!currentDerivedDict) break

      const id = currentDerivedDict._id
      const layer = {
        id,
        initiatingWiresByKey: {},
        derivedDict: currentDerivedDict,
        sourceDerivationsByKey: {},
        untapFromParentChanges: currentDerivedDict.parentChanges().tap(this._notifyStructureNeedsUpdating),
      }
      newStructure.layers.list.unshift(id)
      newStructure.layers.byId[id] = layer

      currentDerivedDict = currentDerivedDict.getParent()
    }

    this._structure = newStructure

    forEach(oldStructure.layers.face.initiatingWiresByKey, (oldWire, key) => {
      this._createWire(key, 'face', oldWire.proxyDerivation)
    })

  }

  changes() {
    return this._changeEmitter
  }

  pointer(): $FixMe {
    if (!this._pointer) {
      this._pointer = pointer({root: this, path: []})
    }
    return this._pointer
  }

  prop(key: MapKey): $FixMe {
    return this.propFromLayer(key, 'face')
  }

  propFromLayer(key: MapKey, initiatingLayerId: 'face' | number): IDerivation<$FixMe> {
    const layer = initiatingLayerId === 'face' ? this._structure.layers.face : this._structure.layers.byId[initiatingLayerId]
    if (!layer)
      throw new Error(`Layer ${initiatingLayerId} doesn't exist. This should never happen`)

    const possibleWireInLayer = layer.initiatingWiresByKey[key]
    if (possibleWireInLayer) {
      return possibleWireInLayer.proxyDerivation
    }

    return this._createWire(key, initiatingLayerId).proxyDerivation
  }

  _createWire(key: MapKey, startsInLayer: 'face' | number, reusableProxy?: IDerivationOfAPropOfPrototypalDictFace<$FixMe>): Wire {
    const endsInLayerId = this._findALayerThatHasProp(key, startsInLayer)

    const sourceDerivation = this._makeSourceDerivation(key, endsInLayerId)
    const proxyDerivation = reusableProxy ? reusableProxy.setTarget(sourceDerivation) : propOfPrototypalDictFace(sourceDerivation)
    const wire =  {key, startsInLayer, endsInLayerId, proxyDerivation}

    const layer = startsInLayer === 'face' ? this._structure.layers.face : this._structure.layers.byId[startsInLayer]
    layer.initiatingWiresByKey[key] = wire
    return wire
  }

  _makeSourceDerivation(key: MapKey, layerId: 'tail' | number): IDerivation<$FixMe> {
    // if (layerId === 'tail')  return notFoundDerivation
    const layer = layerId === 'tail' ? this._structure.layers.tail : this._structure.layers.byId[layerId]
    const possibleSourceDerivation = layer.sourceDerivationsByKey[key]

    if (possibleSourceDerivation) return possibleSourceDerivation

    let derivation
    if (layerId === 'tail') {
      derivation = notFoundDerivation
    } else {
      const lid = layerId
      const constructor = (layer: $FixMe).derivedDict._getConstructor(key)

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
      const derivedDict = layer.derivedDict
      const constructor = derivedDict._getConstructor(key)
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
  constructor(front: DerivedDictFace, sourceLayerId: number) {
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

export type Face = DerivedDictFace

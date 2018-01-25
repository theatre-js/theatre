// @flow
import {IPrototypalDict} from './prototypalDict'
import Emitter from '$shared/DataVerse/utils/Emitter'
// import DerivationOfAPropOfADerivedDict from './DerivationOfAPropOfADerivedDict'
import Ticker from '$shared/DataVerse/Ticker'
import {AbstractDerivation} from '../types'
import {
  AbstractDerivationOfAPropOfPrototypalDictFace,
  default as propOfPrototypalDictFace,
} from './propOfPrototypalDictFace'
import constant from '../constant'
// import StabilizedDerivation from './StabilizedDerivation'
import forEach from 'lodash/forEach'
import pointer from '../pointer'

const NOTFOUND = undefined // Symbol('notfound')
const notFoundDerivation = constant(NOTFOUND)

type Wire = {
  key: string
  startsInLayer: LayerId
  endsInLayerId: LayerId
  proxyDerivation: AbstractDerivationOfAPropOfPrototypalDictFace<$FixMe>
}

export type LayerId = 'face' | 'tail' | number

type Layer = {
  id: number
  initiatingWiresByKey: {[propName: string]: Wire}
  derivedDict: IPrototypalDict<$FixMe>
  sourceDerivationsByKey: {[propName: string]: AbstractDerivation<$FixMe>}
  untapFromParentChanges: () => void
}

type Layers = {
  byId: {[id: LayerId]: Layer}
  list: Array<number>
  face: {initiatingWiresByKey: {[propName: string]: Wire}}
  tail: {sourceDerivationsByKey: {[propName: string]: AbstractDerivation<$FixMe>}}
}

type Structure = {
  layers: Layers
  derivationsByLayerAndKey: {[lk: string]: AbstractDerivation<$FixMe>}
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

export default class PrototypalDictFace {
  isPrototypalDictFace = 'True'
  _head: void | IPrototypalDict<$FixMe>
  _changeEmitter: Emitter<$FixMe>
  _ticker: Ticker
  _structure: Structure
  _pointer: void | $FixMe

  constructor(head: void | IPrototypalDict<$FixMe>, ticker: Ticker) {
    this._head = head
    this._changeEmitter = new Emitter()
    this._ticker = ticker
    this._structure = makeEmptyStructure()
    this._updateStructure = this._updateStructure.bind(this)
    this._updateStructure()
  }

  setHead(head: void | IPrototypalDict<$FixMe>) {
    this._head = head
    this._notifyStructureNeedsUpdating()
  }

  _notifyStructureNeedsUpdating = () => {
    this._ticker.addObjectWhoseStructureShouldBeUpdated(this)
  }

  _updateStructure() {
    const oldStructure = this._structure
    forEach(oldStructure.layers.byId, layer => {
      layer.untapFromParentChanges()
    })

    const newStructure = makeEmptyStructure()

    let currentDerivedDict = this._head
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!currentDerivedDict) break

      const id = currentDerivedDict._id
      const layer = {
        id,
        initiatingWiresByKey: {},
        derivedDict: currentDerivedDict,
        sourceDerivationsByKey: {},
        untapFromParentChanges: currentDerivedDict
          .parentChanges()
          .tap(this._notifyStructureNeedsUpdating),
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

  prop(key: string): $FixMe {
    return this.propFromLayer(key, 'face')
  }

  propFromLayer(
    key: string,
    initiatingLayerId: 'face' | number,
  ): AbstractDerivation<$FixMe> {
    const layer =
      initiatingLayerId === 'face'
        ? this._structure.layers.face
        : this._structure.layers.byId[initiatingLayerId]
    if (!layer)
      throw new Error(
        `Layer ${initiatingLayerId} doesn't exist. This should never happen`,
      )

    const possibleWireInLayer = layer.initiatingWiresByKey[key]
    if (possibleWireInLayer) {
      return possibleWireInLayer.proxyDerivation
    }

    return this._createWire(key, initiatingLayerId).proxyDerivation
  }

  _createWire(
    key: string,
    startsInLayer: 'face' | number,
    reusableProxy?: AbstractDerivationOfAPropOfPrototypalDictFace<$FixMe>,
  ): Wire {
    const endsInLayerId = this._findALayerThatHasProp(key, startsInLayer)

    const sourceDerivation = this._makeSourceDerivation(key, endsInLayerId)
    const proxyDerivation = reusableProxy
      ? reusableProxy.setTarget(sourceDerivation)
      : propOfPrototypalDictFace(sourceDerivation)
    const wire = {key, startsInLayer, endsInLayerId, proxyDerivation}

    const layer =
      startsInLayer === 'face'
        ? this._structure.layers.face
        : this._structure.layers.byId[startsInLayer]
    layer.initiatingWiresByKey[key] = wire
    return wire
  }

  _makeSourceDerivation(
    key: string,
    layerId: 'tail' | number,
  ): AbstractDerivation<$FixMe> {
    // if (layerId === 'tail')  return notFoundDerivation
    const layer =
      layerId === 'tail'
        ? this._structure.layers.tail
        : this._structure.layers.byId[layerId]
    const possibleSourceDerivation = layer.sourceDerivationsByKey[key]

    if (possibleSourceDerivation) return possibleSourceDerivation

    let derivation
    if (layerId === 'tail') {
      derivation = notFoundDerivation
    } else {
      const lid = layerId
      const constructor = (layer as $FixMe).derivedDict._getConstructor(key)

      derivation = notFoundDerivation.flatMap(() =>
        constructor(new ConstructorArg(this, lid)),
      )
    }

    layer.sourceDerivationsByKey[key] = derivation
    return derivation
  }

  _findALayerThatHasProp(key: string, above: 'face' | number): number | 'tail' {
    const startingIndex =
      above === 'face'
        ? this._structure.layers.list.length - 1
        : this._structure.layers.list.indexOf(above) - 1
    if (startingIndex < 0) return 'tail'

    for (let i = startingIndex; i >= 0; i--) {
      const layerId = this._structure.layers.list[i]

      const layer: Layer = this._structure.layers.byId[layerId] as $FixMe
      const derivedDict = layer.derivedDict
      const constructor = derivedDict._getConstructor(key)
      if (constructor) {
        return layerId
      }
    }

    return 'tail'
  }

  keys() {
    return this._head ? this._head.keys() : {}
  }
}

class ConstructorArg {
  _front: $FixMe
  _sourceLayerId: number
  constructor(front: PrototypalDictFace, sourceLayerId: number) {
    this._front = front
    this._sourceLayerId = sourceLayerId
  }

  prop(key: string) {
    return this._front.prop(key)
  }

  pointer() {
    return this._front.pointer()
  }

  propFromAbove(key) {
    return this._front.propFromLayer(key, this._sourceLayerId)
  }
}

export type Face = PrototypalDictFace

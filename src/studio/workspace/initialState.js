// @flow
import {type WorkspaceNamespaceState} from './types'
import * as D from '$shared/DataVerse'

const initialState: WorkspaceNamespaceState = D.literals.object({
  panels: D.literals.object({
    byId: D.literals.object({
      '1': D.literals.object({
        pos: D.literals.object({x: D.literals.primitive(5), y: D.literals.primitive(10)}),
        dim: D.literals.object({x: D.literals.primitive(30), y: D.literals.primitive(40)}),
      }),
      '2': D.literals.object({
        pos: D.literals.object({x: D.literals.primitive(50), y: D.literals.primitive(30)}),
        dim: D.literals.object({x: D.literals.primitive(30), y: D.literals.primitive(40)}),
      }),
    }),
    listOfVisibles: D.literals.array([D.literals.primitive('1'), D.literals.primitive('2')]),
  }),
  componentIdToBeRenderedAsCurrentCanvas: D.literals.primitive('TheaterJS/Core/FakeDeclarativeButton'),
})

export default initialState
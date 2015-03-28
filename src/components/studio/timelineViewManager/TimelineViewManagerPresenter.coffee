Emitter = require 'utila/lib/events/Emitter'
El = require 'stupid-dom-interface'

module.exports = class TimelineViewManagerPresenter
	constructor: ->
		@_elementsList = []
		@_elementsByID = {}

		@_model = null
		@_modelEvents = new Emitter
		@_modelEvents.on 'IDs:didChange', => @_updateFromModel()

		@_prepareEl()

	_prepareEl: ->
		@_el = El '.studio-timelineViewManager'
		.inside document.body

	setModel: (@_model) ->
		@_modelEvents.unsubscribe()
		@_modelEvents.subscribe @_model.events
		@_updateFromModel()

		return

	_updateFromModel: ->
		newIDs = @_model.getIDs()
		newElementsByID = {}

		for id, order in newIDs
			if @_elementsByID[id]?
				elemento = @_elementsByID[id]
			else
				elemento = new Elemento id
				elemento.attach @_el

			newElementsByID[id] = elemento

			elemento.setOrder order

		for elemento in @_elementsList
			unless newElementsByID[elemento.id]?
				elemento.detach()
				delete @_elementsByID[elemento.id]

		@_elementsByID = newElementsByID
		@_elementsList = Object.keys(newElementsByID).map((id) -> newElementsByID[id])

		return

class Elemento
	constructor: (@id) ->
		@_el = El '.elemento'
		.css position: 'absolute'
		.html @id

	detach: ->
		@_el.detach()

	attach: (toNode) ->
		@_el.inside toNode

	setOrder: (order) ->
		@_el.y order * 30
Scrolla = require './Scrolla'
Emitter = require 'utila/scripts/js/lib/Emitter'
El = require 'stupid-dom-interface'

module.exports = class View extends Emitter

	constructor: (@scrollableArea) ->

		super

		@theatre = @scrollableArea.theatre

		@model = @scrollableArea.model

		@box = @scrollableArea.box

		do @_initScrolla

		do @_prepareContainer

		do @_prepareInteractions

		do @_prepareConversions

	_initScrolla: ->

		@scrolla = new Scrolla

		@scrolla.on 'position-change', => do @_readPositionFromScrolla

		@scrolla
		.setSizeAndSpace Math.pow(10, 20), 1000
		.setLeftEdge 0

	_readPositionFromScrolla: ->

		time = @xToTime_ -@scrolla.position

		@model.setTimeFocus time, @model.timeFocus.length

	_prepareContainer: ->

		@containerNode = El '.theatrejs-timelineBox-scrollableArea'
		.inside @box.view.containerNode

	_prepareInteractions: ->

		{moosh, cursor} = @theatre

		moosh.onMiddleDrag @containerNode
		.withNoKeys()
		.onStart =>

			cursor.use 'grab'

			do @_startDragging

		.onDrag (e) =>

			cursor.use 'grabbing'

			@_dragBy e.relX, e.relY

		.onEnd =>

			cursor.free()

			do @_endDragging

	_startDragging: ->

	_dragBy: (x, y) ->

		@scrolla.drag x

	_endDragging: ->

		@scrolla.release()

	_prepareConversions: ->

		@box.view.on 'dims-change', => do @_updateDims

		do @_updateDims

	_updateDims: ->

		@width = @box.view.width
		@height = @box.view.height

		@scrolla.setSizeAndSpace null, @width

	timeToX: (t) ->

		(t - @model.timeFocus.start) / @model.timeFocus.length * @width

	xToTime_: (x) ->

		x * @model.timeFocus.length / @width
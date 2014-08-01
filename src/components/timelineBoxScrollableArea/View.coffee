Scrolla = require './Scrolla'
Emitter = require 'utila/scripts/js/lib/Emitter'
El = require 'stupid-dom-interface'

module.exports = class View extends Emitter

	constructor: (@scrollableArea) ->

		super

		@theatre = @scrollableArea.theatre

		@model = @scrollableArea.model

		@model.on 'timeFocus-change', => @_emit 'view-change'

		@box = @scrollableArea.box

		do @_initScrolla

		do @_prepareContainer

		do @_prepareInteractions

		do @_prepareConversions

	_initScrolla: ->

		@scrolla = new Scrolla maxStretch: 1500

		@scrolla.on 'position-change', => do @_readPositionFromScrolla

		@scrolla
		.setSizeAndSpace Math.pow(10, 20), 1000
		.setLeftEdge 0

	_readPositionFromScrolla: ->

		time = @absoluteXToTime -@scrolla.position

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

		moosh.onWheel @containerNode
		.onWheel (e) =>

			@multiplyTimeZoom 1 + (-e.delta / 120 / 8), e.layerX

	multiplyTimeZoom: (zoomMult, x) ->

		pivotInLen = x / @width

		timeFocus = @model.timeFocus

		curLen = timeFocus.length
		curStart = timeFocus.start
		curTo = curStart + curLen

		newLen = curLen * zoomMult

		if newLen < 100

			zoomMult = 100 / curLen

			newLen = 100

		oldLeftHalf = pivotInLen * curLen

		newLeftHalf = oldLeftHalf * zoomMult

		newFrom = curStart - (newLeftHalf - oldLeftHalf)

		oldRightHalf = (1 - pivotInLen) * curLen

		newRightHalf = oldRightHalf * zoomMult

		newTo = curTo + (newRightHalf - oldRightHalf)

		if newFrom < 0

			newTo += -newFrom

			newFrom = 0

		newLen = newTo - newFrom

		@rewriteTimeFocus newFrom, newLen

		return

	rewriteTimeFocus: (from, len) ->

		@model.setTimeFocus from, len

		@scrolla.position = -@timeToAbsoluteX from

		@scrolla.stop()

	_startDragging: ->

		@scrolla.drag 0

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

		@_emit 'view-change'

	timeToX: (t) ->

		(t - @model.timeFocus.start) / @model.timeFocus.length * @width

	absoluteXToTime: (x) ->

		x * @model.timeFocus.length / @width

	timeToAbsoluteX: (t) ->

		t * @width / @model.timeFocus.length
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

		do @_initLengthCalculations

	_initScrolla: ->

		@scrolla = new Scrolla maxStretch: 1500

		@scrolla.on 'position-change', => do @_readPositionFromScrolla

		@scrolla
		.setSizeAndSpace Math.pow(10, 20), 1000
		.setLeftEdge 0

	_readPositionFromScrolla: ->

		time = @absoluteXToTime -@scrolla.position

		@model.setTimeFocus time, @model.focusLength

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

		{focusStart, focusLength} = @model

		curLen = focusLength
		curStart = focusStart
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

		@timeFocus = start: 0, length: 0

		@model.on 'timeFocus-change', => do @_updateTimeFocus

		do @_updateTimeFocus

		@box.view.on 'dims-change', => do @_updateDims

		@_updateDims no

	_updateTimeFocus: ->

		@timelineLength = @model.timelineLength
		@filledTimelineLength = @model.filledTimelineLength

		@focusStart = @model.focusStart
		@focusLength = @model.focusLength
		@focusEnd = @focusStart + @focusLength

		@_emit 'view-change'

	_updateDims: (emit = yes) ->

		@width = @box.view.width
		@height = @box.view.height

		@scrolla.setSizeAndSpace null, @width

		@_emit 'view-change' if emit

	_initLengthCalculations: ->

		@length = @model.length

		@model.on 'length-change', =>

			@length = @model.length

			@_emit 'length-change'

		@timeFocus =

			start: @model.focusStart
			length: @model.focusLength

	# Used for the seeker and almost everything else
	timeToFocusedX: (t) ->

		(t - @model.focusStart) / @model.focusLength * @width

	absoluteXToTime: (x) ->

		x * @model.focusLength / @width

	timeToAbsoluteX: (t) ->

		t * @width / @model.focusLength

	# Used for the panner
	timeToUnfocusedX: (t) ->

		t / @model.length * @width

	unfocusedXToTime: (x) ->

		x / @width * @model.length
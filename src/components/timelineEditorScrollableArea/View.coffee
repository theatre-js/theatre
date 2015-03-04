Scrolla = require './Scrolla'
PipingEmitter = require 'utila/lib/PipingEmitter'
El = require 'stupid-dom-interface'

module.exports = class View

	constructor: (@scrollableArea) ->

		@events = new PipingEmitter

		@studio = @scrollableArea.studio

		@model = @scrollableArea.model

		@editor = @scrollableArea.editor

		do @_initScrolla

		do @_prepareContainers

		do @_prepareInteractions

		do @_prepareConversions

	_initScrolla: ->

		@scrolla = new Scrolla maxStretch: 1500

		@scrolla.events.on 'position-change', => do @_readPositionFromScrolla

		@scrolla
		.setSizeAndSpace Math.pow(10, 20), 1000
		.setLeftEdge 0

	_readPositionFromScrolla: ->

		time = @absoluteXToTime -@scrolla.position

		@model.setTimeFocus time, @model.focusLength

	_prepareContainers: ->

		@containerEl = El '.studiojs-timelineEditor-scrollableArea'
		.inside @editor.view.containerEl

		@svgEl = El 'svg:svg.studiojs-timelineEditor-scrollableArea-svgContainer'
		.inside @editor.view.containerEl

	_prepareInteractions: ->

		{moosh, cursor} = @studio

		moosh.onMiddleDrag @containerEl
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

		moosh.onWheel @containerEl
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

		@rewriteFocusWithoutStopping newFrom, newLen

		return

	shiftFocus: (delta, disallowOutOfBounds = no) ->

		start = @model.focusStart + delta

		start = 0 if disallowOutOfBounds and start < 0

		@rewriteFocus start

	rewriteFocus: (from, len) ->

		@rewriteFocusWithoutStopping from, len

		@scrolla.stop()

	rewriteFocusWithoutStopping: (from, len = @model.focusLength) ->

		@model.setTimeFocus from, len

		@scrolla.position = -@timeToAbsoluteX from

	_startDragging: ->

		@scrolla.drag 0

	_dragBy: (x, y) ->

		@scrolla.drag x

	_endDragging: ->

		@scrolla.release()

	_prepareConversions: ->

		@timeFocus = start: 0, length: 0

		@model.events.on 'timeFocus-change', => do @_updateTimeFocus

		do @_updateTimeFocus

		@editor.view.events.on 'dims-change', => do @_updateDims

		@_updateDims no

	_updateTimeFocus: ->

		@timelineLength = @model.timelineLength
		@filledTimelineLength = @model.filledTimelineLength

		@focusStart = @model.focusStart
		@focusLength = @model.focusLength
		@focusEnd = @focusStart + @focusLength

		@events._emit 'view-change'

	_updateDims: (emit = yes) ->

		@width = @editor.view.width
		@height = @editor.view.height

		@svgEl
		.attr 'width', "#{@width}px"
		.attr 'height', "#{@height}px"

		@scrolla.setSizeAndSpace null, @width

		@events._emit 'view-change' if emit

	# Used for the seeker and almost everything else
	timeToFocusedX: (t) ->

		(t - @model.focusStart) / @model.focusLength * @width

	absoluteXToTime: (x) ->

		x * @model.focusLength / @width

	timeToAbsoluteX: (t) ->

		t * @width / @model.focusLength

	# Used for the panner
	timeToUnfocusedX: (t) ->

		t / @timelineLength * @width

	unfocusedXToTime: (x) ->

		x / @width * @timelineLength
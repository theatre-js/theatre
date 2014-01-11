Foxie = require 'foxie'

module.exports = class Selection

	constructor: (@prop) ->

		@rootView = @prop.rootView

		@_selecting = no

		@_from = 0
		@_to = 0
		@_selected = no

		do @_prepareNode

		do @_prepareInteractions

	_prepareNode: ->

		@node = Foxie('.timeflow-timeline-prop-selection')
		.putIn(@prop.pacsNode)
		.moveX(-5000)

		@leftEdge = Foxie('.timeflow-timeline-prop-selection-leftEdge')
		.putIn(@node)

		@rightEdge = Foxie('.timeflow-timeline-prop-selection-rightEdge')
		.putIn(@node)

	_prepareInteractions: ->

		do @_prepareSelectInteraction
		do @_prepareDeselectInteraction

	_prepareDeselectInteraction: ->

		@rootView.moosh.onClick(@prop.node)
		.withNoKeys()
		.onUp =>

			do @_deselect

	_prepareSelectInteraction: ->

		start = 0

		@rootView.moosh.onDrag(@prop.node)
		.withKeys('shift')
		.onDown (e) =>

			start = e.layerX

			do @_startSelecting

			@_select start, start

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if e.layerX > start

				@_select start, e.layerX

			else

				@_select e.layerX, start

		.onUp =>

			do @_endSelecting

			@rootView.cursor.free()

		.onCancel =>

			do @_endSelecting

			do @_hide

			@rootView.cursor.free()

	_startSelecting: ->

		@_selecting = yes

		do @_show

	_endSelecting: ->

		@_selecting = no

	_select: (localFromX, localToX) ->

		fromTime = @prop.timeline._XToFocusedTime localFromX
		fromX = @prop._timeToX fromTime

		toTime = @prop.timeline._XToFocusedTime localToX
		toX = @prop._timeToX toTime

		@node
		.moveXTo(fromX)
		.css('width', parseInt(toX - fromX) + 'px')

	_deselect: ->

		@_selected = no

		do @_hide

	_hide: ->

		@node.moveYTo(-5000)

	_show: ->

		@node.moveYTo(0)


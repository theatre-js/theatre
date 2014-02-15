Foxie = require 'foxie'

module.exports = class Selection

	constructor: (@prop) ->

		@rootView = @prop.rootView

		@_selecting = no

		@_fromTime = 0
		@_toTime = 0

		@_fromX = 0
		@_toX = 0
		@_selected = no

		@_items = []

		do @_prepareNode

		do @_prepareInteractions

	_prepareNode: ->

		@node = Foxie('.theatrejs-timelineEditor-prop-selection')
		.putIn(@prop.pacsNode)
		.moveX(-5000)

		@leftEdge = Foxie('.theatrejs-timelineEditor-prop-selection-leftEdge')
		.putIn(@node)

		@rightEdge = Foxie('.theatrejs-timelineEditor-prop-selection-rightEdge')
		.putIn(@node)

	_prepareInteractions: ->

		do @_prepareSelectInteraction
		do @_prepareModifySelectionInteraction
		do @_prepareDeselectInteraction

	_prepareDeselectInteraction: ->

		@_deselectListener = @rootView.moosh.onClick(@prop.node)
		.withNoKeys()
		.disable()
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

	_prepareModifySelectionInteraction: ->

		lastFromX = 0
		lastToX = 0

		@rootView.moosh.onDrag @leftEdge
		.onDown =>

			lastFromX = @_fromX
			lastToX = @_toX

			do @_startSelecting

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if lastFromX + e.absX <= lastToX

				@_select lastFromX + e.absX, lastToX

			else

				@_select lastToX, lastFromX + e.absX

		.onUp =>

			do @_endSelecting

			@rootView.cursor.free()

		@rootView.moosh.onDrag @rightEdge
		.onDown =>

			lastFromX = @_fromX
			lastToX = @_toX

			do @_startSelecting

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if lastToX + e.absX >= lastFromX

				@_select lastFromX, lastToX + e.absX

			else

				@_select lastToX + e.absX, lastFromX

		.onUp =>

			do @_endSelecting

			@rootView.cursor.free()

	_startSelecting: ->

		@_selecting = yes

		do @_show

	_endSelecting: ->

		@_selecting = no

		@_items = @prop.pacs.getPointsInRange @_fromTime, @_toTime

		if @_items.length < 2

			do @_deselect

			return

		@_fromTime = @_items[0].t

		@_toTime = @_items[@_items.length - 1].t

		do @_updateEl

	_select: (localFromX, localToX) ->

		@_fromTime = @prop.timelineEditor._XToFocusedTime localFromX

		@_toTime = @prop.timelineEditor._XToFocusedTime localToX

		do @_updateEl

	_updateEl: ->

		@_fromX = @prop._timeToX @_fromTime

		@_toX = @prop._timeToX @_toTime

		@node
		.moveXTo(@_fromX)
		.css('width', parseInt(@_toX - @_fromX) + 'px')

	_deselect: ->

		@_selected = no

		do @_hide

	_hide: ->

		@node.moveYTo(-5000)

		@_deselectListener.disable() if @_deselectListener.enabled

	_show: ->

		@node.moveYTo(0)

		@_deselectListener.enable() unless @_deselectListener.enabled
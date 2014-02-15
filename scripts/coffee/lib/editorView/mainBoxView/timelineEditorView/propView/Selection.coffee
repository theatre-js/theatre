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

		@_pacSelection = null

		do @_prepareNode

		do @_prepareInteractions

	relayHorizontally: ->

		return unless @_selected

		do @_updateEl

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

			@_selectByLocalX start, start

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if e.layerX > start

				@_selectByLocalX start, e.layerX

			else

				@_selectByLocalX e.layerX, start

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

			lastFromX = @_fromX + 1
			lastToX = @_toX - 1

			do @_startSelecting

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if lastFromX + e.absX <= lastToX

				@_selectByX lastFromX + e.absX, lastToX

			else

				@_selectByX lastToX, lastFromX + e.absX

		.onUp =>

			do @_endSelecting

			@rootView.cursor.free()

		@rootView.moosh.onDrag @rightEdge
		.onDown =>

			lastFromX = @_fromX + 1
			lastToX = @_toX - 1

			do @_startSelecting

			@rootView.cursor.use 'ew-resize'

		.onDrag (e) =>

			if lastToX + e.absX >= lastFromX

				@_selectByX lastFromX, lastToX + e.absX

			else

				@_selectByX lastToX + e.absX, lastFromX

		.onUp =>

			do @_endSelecting

			@rootView.cursor.free()

		@rootView.moosh.onClick @leftEdge
		.repeatedBy 2
		.onDone =>

			do @_startSelecting

			@_selectByTime 0, @_toTime

			do @_endSelecting

		@rootView.moosh.onClick @rightEdge
		.repeatedBy 2
		.onDone =>

			do @_startSelecting

			@_selectByTime @_fromTime, @prop.pacs.chronologyLength

			do @_endSelecting

	_startSelecting: ->

		@_selecting = yes

		@_pacSelection = null

		do @_show

	_endSelecting: ->

		@_selecting = no

		@_selected = yes

		@_pacSelection = @prop.pacs.getSelection @_fromTime, @_toTime

		do @_updateEl

	_selectByLocalX: (localFromX, localToX) ->

		@_fromTime = @prop.timelineEditor._XToFocusedTime localFromX

		@_toTime = @prop.timelineEditor._XToFocusedTime localToX

		do @_updateEl

	_selectByX: (fromX, toX) ->

		@_fromTime = @prop._XToTime fromX

		@_toTime = @prop._XToTime toX

		do @_updateEl

	_selectByTime: (@_fromTime, @_toTime) ->

		do @_updateEl

	_updateEl: ->

		if @_pacSelection? and @_pacSelection.empty

			@node.addClass 'empty'

		else

			@node.removeClass 'empty'

		@_fromX = @prop._timeToX(@_fromTime) - 1

		@_toX = @prop._timeToX(@_toTime) + 1

		@node
		.moveXTo(@_fromX)
		.css('width', parseInt(@_toX - @_fromX) + 'px')

	_deselect: ->

		@_selected = no

		@_pacSelection = null

		do @_hide

	_hide: ->

		@node.moveYTo(-5000)

		@_deselectListener.disable() if @_deselectListener.enabled

	_show: ->

		@node.moveYTo(0)

		@_deselectListener.enable() unless @_deselectListener.enabled
Foxie = require 'foxie'

module.exports = class Selection

	constructor: (@prop) ->

		@rootView = @prop.rootView

		@timelineEditor = @prop.timelineEditor

		@_selecting = no

		@_fromTime = 0
		@_toTime = 0

		@_fromX = 0
		@_toX = 0
		@_selected = no

		@_pacSelection = null

		do @_prepareNode

		do @_prepareHollow

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

	_prepareHollow: ->

		@hollow = Foxie('.theatrejs-timelineEditor-prop-selection-hollow')
		.putIn(@prop.pacsNode)
		.moveYTo(-5000)

	_prepareInteractions: ->

		do @_prepareSelectInteraction
		do @_prepareDeselectInteraction
		do @_prepareShiftSelectionInteractions
		do @_prepareModifySelectionInteractions

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

	_prepareModifySelectionInteractions: ->

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

			@_selectByTime 0, @_toTime

			do @_endSelecting

		@rootView.moosh.onClick @rightEdge
		.repeatedBy 2
		.onDone =>

			@_selectByTime @_fromTime, @prop.pacs.timeline.duration

			do @_endSelecting

		# this will shrink the selection to its effective area
		@rootView.moosh.onClick @node
		.repeatedBy 2
		.onDone =>

			if @_pacSelection.empty

				do @_deselect

			else

				@_selectByTime @_pacSelection.realFrom, @_pacSelection.realTo

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

		@_fromTime = @timelineEditor._XToFocusedTime localFromX

		@_toTime = @timelineEditor._XToFocusedTime localToX

		do @_updateEl

	_selectByX: (fromX, toX) ->

		@_fromTime = @timelineEditor._XToTime fromX

		@_toTime = @timelineEditor._XToTime toX

		do @_updateEl

	_selectByTime: (@_fromTime, @_toTime) ->

		do @_updateEl

	_updateEl: ->

		if @_pacSelection? and @_pacSelection.empty

			@node.addClass 'empty'

		else

			@node.removeClass 'empty'

		@_fromX = @timelineEditor._timeToX(@_fromTime) - 1

		@_toX = @timelineEditor._timeToX(@_toTime) + 1

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

	_showHollow: ->

		@hollow.moveYTo 0

	_hideHollow: ->

		@hollow.moveYTo -5000

	_resizeHollow: ->

		@hollow
		.css('width', parseInt(@_toX - @_fromX) + 'px')

	_updateHollow: (fromX, toX) ->

		@hollow
		.moveXTo(fromX)

	_prepareShiftSelectionInteractions: ->

		firstDrag = yes

		lastDelta = 0

		couldMove = no

		@rootView.moosh.onDrag @node
		.withNoKeys()
		.onDown (e) =>

			if @_pacSelection.empty

				e.cancel()

				return

			firstDrag = yes

		.onDrag (e) =>

			if firstDrag

				@rootView.cursor.use 'move'

				do @_resizeHollow

				do @_showHollow

				@node.addClass 'moving'

				firstDrag = no

			@_updateHollow @_fromX + e.absX, @_toX + e.absX

			lastDelta = @timelineEditor._XToTime e.absX

			if couldMove = @_pacSelection.canMoveBy lastDelta

				@hollow.removeClass 'bad'

			else

				@hollow.addClass 'bad'

		.onUp =>

			@rootView.cursor.free()

			do @_hideHollow

			@node.removeClass 'moving'

			return unless couldMove

			@_pacSelection.moveBy lastDelta

			@_fromTime += lastDelta
			@_toTime += lastDelta

			@prop.pacs.done()

			do @_updateEl
Foxie = require 'foxie'

module.exports = class SeekbarView

	constructor: (@mainBox) ->

		@rootView = @mainBox.rootView

		@model = @mainBox.editor.model.timeControl

		@timelineLength = @model.timelineLength

		@timeline = @mainBox.timeline

		@model.on 'length-change', => do @_updateTimelineLength

		do @_prepareNode

		do @_prepareGrid

		do @_prepareSeeker

		do @_prepareFocus

		do @_resetSpace

		@mainBox.on 'width-change', => do @_resetSpace

	_prepareNode: ->

		@node = Foxie('.timeflow-seekbar')
		.putIn(@mainBox.node)

	_prepareGrid: ->

		@grid = Foxie('.timeflow-seekbar-timeGrid').putIn @mainBox.node

		@gridLegends = []

		for i in [0..parseInt(screen.width / 75)]

			@gridLegends.push Foxie('.timeflow-seekbar-timeGrid-legend').putIn(@grid)

		return

	_redoTimeGrid: ->

		focus = @model.getFocusArea()

		for legend, i in @gridLegends

			curX = i * 75 + 37.5

			w = curX / @_width

			w *= focus.duration

			w += focus.from

			w /= 1000

			legend.node.innerHTML = w.toFixed(2)

		return

	_prepareSeeker: ->

		@seeker = Foxie('.timeflow-seekbar-seeker')
		.moveZ(1)
		.putIn(@node)

		@model.on 'time-change', =>

			do @_updateT



		wasPlaying = no

		@rootView.moosh.onDrag(@seeker)

		.onDown =>

			@rootView.cursor.use @seeker

			wasPlaying = @model.isPlaying()

			@model.pause() if wasPlaying

		.onUp =>

			@rootView.cursor.free()

			if wasPlaying then @model.play()

		.onDrag (e) =>

			@_dragSeekerRelatively e.relX

		return

	_prepareFocus: ->

		do @_prepareFocusLeft

		do @_prepareFocusRight

		do @_prepareFocusStrip

		@model.on 'focus-change', =>

			return if @_reactToFocusChangeAndDecideOnRepositioningElements()

			do @_repositionElements

	_prepareFocusLeft: ->

		@focusLeftNode = Foxie('.timeflow-seekbar-focus-left')
		.moveZ(1)
		.set('left', 0)
		.putIn(@node)

		@rootView.moosh.onDrag(@focusLeftNode)

		.onDown =>

			@rootView.cursor.use @focusLeftNode

		.onUp =>

			@rootView.cursor.free()

		.onDrag (e) =>

			@_dragFocusLeftInWindowSpace e.relX

	_prepareFocusRight: ->

		@focusRightNode = Foxie('.timeflow-seekbar-focus-right')
		.moveZ(1)
		.set('left', 0)
		.putIn(@node)

		@rootView.moosh.onDrag(@focusRightNode)

		.onDown =>

			@rootView.cursor.use @focusRightNode

		.onUp =>

			@rootView.cursor.free()

		.onDrag (e) =>

			@_dragFocusRightInWindowSpace e.relX

	_prepareFocusStrip: ->

		@focusStripNode = Foxie('.timeflow-seekbar-focus-strip')
		.moveZ(1)
		.css('width', '300px')
		.putIn(@node)

		@rootView.moosh.onDrag(@focusStripNode)
		.onDown =>

			@focusStripNode.addClass 'dragging'

			@rootView.cursor.use @focusStripNode

		.onDrag (e) =>

			@_dragFocusStripBy e.relX

		.onUp =>

			@focusStripNode.removeClass 'dragging'

			@rootView.cursor.free()

	_dragFocusStripBy: (x) ->

		t = @timeline._XToTime x

		focus = @model.getFocusArea()

		newFrom = focus.from + t

		if newFrom < 0

			newFrom = 0

		newTo = newFrom + focus.duration

		if newTo > @timelineLength

			newTo = @timelineLength

			newFrom = newTo - focus.duration

		@model.changeFocusArea newFrom, newTo

		return

	_dragFocusBy: (x) ->

		t = @timeline._XToFocusDuration x

		focus = @model.getFocusArea()

		newFrom = focus.from + t

		if newFrom < 0

			newFrom = 0

		newTo = newFrom + focus.duration

		if newTo > @timelineLength

			newTo = @timelineLength

			newFrom = newTo - focus.duration

		@model.changeFocusArea newFrom, newTo

		return

	_dragFocusLeftInWindowSpace: (x) ->

		focus = @model.getFocusArea()

		curWinPos = @focusLeftNode.get('left')

		nextWinPos = curWinPos + x

		# the from part
		nextFrom = @timeline._XToTime nextWinPos

		if nextFrom < 0

			nextFrom = 0

		# and the next to
		nextTo = focus.to

		if nextTo - nextFrom < 1000

			nextTo = nextFrom + 1000

		if nextTo > @timelineLength

			nextTo = @timelineLength

		# update the model
		@model.changeFocusArea nextFrom, nextTo

		# if the seeker is before the new from
		if nextFrom > @model.t

			# put it on the new from
			@model.tick nextFrom

		# if seeker is after the new focused area
		if nextTo < @model.t

			# put it on the end of the new focused area
			@model.tick nextTo

		return

	_dragFocusRightInWindowSpace: (x) ->

		focus = @model.getFocusArea()

		curWinPos = @focusRightNode.get('left')

		nextWinPos = curWinPos + x

		# the to part
		nextTo = @timeline._XToTime nextWinPos

		if nextTo > @timelineLength

			nextTo = @timelineLength

		if nextTo < 1000

			nextTo = 1000

		# and the next to
		nextFrom = focus.from

		if nextTo - nextFrom < 1000

			nextFrom = nextTo - 1000

		if nextFrom < 0

			nextFrom = 0

		# update the model
		@model.changeFocusArea nextFrom, nextTo

		# if the seeker is before the new from
		if @model.t > nextTo

			# put it on the new from
			@model.tick nextTo

		# if seeker is after the new focused area
		if nextFrom > @model.t

			# put it on the end of the new focused area
			@model.tick nextFrom

		return

	_resetSpace: ->

		@_width = @mainBox.width

		do @_repositionElements

	_repositionElements: ->

		do @_repositionSeeker

		do @_repositionFocus

		do @_redoTimeGrid

	_updateT: ->

		t = @model.t

		focus = @model.getFocusArea()

		# while playing, we might have gone out of bounds
		# of the focused area
		unless focus.from <= t <= focus.to

			newFrom = t

			newTo = newFrom + focus.duration

			if focus.to < t and newTo > @timelineLength

				shift = newTo - @timelineLength

				newTo = @timelineLength

				newFrom -= shift

				if newFrom < 0 then newFrom = 0

			@model.changeFocusArea newFrom, newTo

			return

		do @_repositionSeeker

		return

	_repositionSeeker: ->

		curSeekerPos = @timeline._timeToFocusedX @model.t

		@seeker
		.moveXTo(curSeekerPos)
		.set('left', curSeekerPos)

		return

	# In my defence, There are only two hard things in Computer Science:
	# cache invalidation and naming things. -- Phil Karlton
	_reactToFocusChangeAndDecideOnRepositioningElements: ->

		t = @model.t

		focus = @model.getFocusArea()

		if t < focus.from

			@model.tick focus.from

			return yes

		else if t > focus.to

			@model.tick focus.to

			return yes

		no

	_dragSeekerRelatively: (x) ->

		toPos = @seeker.get('left') + x

		focus = @model.getFocusArea()

		t = @timeline._XToFocusedTime toPos

		t = 0 if t < 0

		t = @timelineLength if t > @timelineLength

		@model.tick t

		return

	_repositionFocus: ->

		focus = @model.getFocusArea()

		left = @timeline._timeToX focus.from

		@focusLeftNode
		.moveXTo(left)
		.set('left', left)

		right = @timeline._timeToX focus.from + focus.duration

		@focusRightNode
		.moveXTo(right)
		.set('left', right)

		@focusStripNode
		.moveXTo(left)
		.css('width', (right - left) + 'px')

		return

	_updateTimelineLength: ->

		@timelineLength = @model.timelineLength

		do @_repositionElements

	_seekToX: (toPos) ->

		focus = @model.getFocusArea()

		t = @timeline._XToFocusedTime toPos

		t = 0 if t < 0

		t = @timelineLength if t > @timelineLength

		@model.tick t

		return

	_zoomFocus: (zoomMult, x) ->

		focus = @model.getFocusArea()

		pivotInDur = x / @_width

		newDuration = focus.duration * zoomMult

		if newDuration > @timelineLength

			newFrom = 0

			newTo = @timelineLength

			@model.changeFocusArea newFrom, newTo

			return

		if newDuration < 1000

			zoomMult = 1000 / focus.duration

			newDuration = 1000

		oldLeftHalf = pivotInDur * focus.duration

		newLeftHalf = oldLeftHalf * zoomMult

		newFrom = focus.from - (newLeftHalf - oldLeftHalf)

		oldRightHalf = (1 - pivotInDur) * focus.duration

		newRightHalf = oldRightHalf * zoomMult

		newTo = focus.to + (newRightHalf - oldRightHalf)

		if newFrom < 0

			newFrom = 0

		if newTo > @timelineLength

			newTo = @timelineLength

		newDur = newTo - newFrom

		@model.changeFocusArea newFrom, newTo

		return
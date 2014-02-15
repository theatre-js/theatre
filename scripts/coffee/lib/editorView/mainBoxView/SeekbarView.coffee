Foxie = require 'foxie'

module.exports = class SeekbarView

	constructor: (@mainBox) ->

		@rootView = @mainBox.rootView

		@model = @mainBox.editor.model.timeControl

		@duration = @model.duration

		@timelineEditor = @mainBox.timelineEditor

		@model.on 'duration-change', => do @_updateDuration

		do @_prepareNode

		do @_prepareGrid

		do @_prepareSeeker

		do @_prepareFocus

		do @_resetSpace

		@mainBox.on 'width-change', => do @_resetSpace

	_prepareNode: ->

		@node = Foxie('.theatrejs-seekbar')
		.putIn(@mainBox.node)

	_prepareGrid: ->

		@grid = Foxie('.theatrejs-seekbar-timeGrid').putIn @mainBox.node

		@gridLegends = []

		for i in [0..parseInt(screen.width / 75)]

			@gridLegends.push Foxie('.theatrejs-seekbar-timeGrid-legend').putIn(@grid)

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

		@seeker = Foxie('.theatrejs-seekbar-seeker')
		.moveZ(1)
		.putIn(@node)

		@model.on 'time-change', => do @_updateT

		wasPlaying = no

		initialSeekerPosition = 0

		@rootView.moosh.onDrag(@seeker)

		.onDown =>

			@rootView.cursor.use @seeker

			wasPlaying = @model.isPlaying()

			@model.pause() if wasPlaying

			initialSeekerPosition = @seeker.get('left')

		.onUp =>

			@rootView.cursor.free()

			if wasPlaying then @model.play()

		.onDrag (e) =>

			# i hate it when there are numbers in my code
			@_dragSeekerToPos e.absX + initialSeekerPosition

		return

	_prepareFocus: ->

		do @_prepareFocusLeft

		do @_prepareFocusRight

		do @_prepareFocusStrip

		@model.on 'focus-change', =>

			if @_reactToFocusChangeAndDecideOnRepositioningElements()

				do @_repositionExceptSeeker

			else

				do @_repositionElements

	_prepareFocusLeft: ->

		@focusLeftNode = Foxie('.theatrejs-seekbar-focus-left')
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

		@focusRightNode = Foxie('.theatrejs-seekbar-focus-right')
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

		@focusStripNode = Foxie('.theatrejs-seekbar-focus-strip')
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

		t = @timelineEditor._unfocusedXToTime x

		focus = @model.getFocusArea()

		newFrom = focus.from + t

		if newFrom < 0

			newFrom = 0

		newTo = newFrom + focus.duration

		if newTo > @duration

			newTo = @duration

			newFrom = newTo - focus.duration

		@model.changeFocusArea newFrom, newTo

		return

	_dragFocusBy: (x) ->

		t = @timelineEditor._XToTime x

		focus = @model.getFocusArea()

		newFrom = focus.from + t

		if newFrom < 0

			newFrom = 0

		newTo = newFrom + focus.duration

		if newTo > @duration

			newTo = @duration

			newFrom = newTo - focus.duration

		@model.changeFocusArea newFrom, newTo

		return

	_dragFocusLeftInWindowSpace: (x) ->

		focus = @model.getFocusArea()

		curWinPos = @focusLeftNode.get('left')

		nextWinPos = curWinPos + x

		# the from part
		nextFrom = @timelineEditor._unfocusedXToTime nextWinPos

		if nextFrom < 0

			nextFrom = 0

		# and the next to
		nextTo = focus.to

		if nextTo - nextFrom < 1000

			nextTo = nextFrom + 1000

		if nextTo > @duration

			nextTo = @duration

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
		nextTo = @timelineEditor._unfocusedXToTime nextWinPos

		if nextTo > @duration

			nextTo = @duration

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

	_repositionExceptSeeker: ->

		do @_repositionFocus

		do @_redoTimeGrid

	_updateT: ->

		t = @model.t

		focus = @model.getFocusArea()

		# while playing, we might have gone out of bounds
		# of the focused area
		#
		# todo: this 16ms tolerance is arbitrary, and it makes
		# up for the fact that AudioDrivenTimeControl starts
		# playing 16ms before the last `timeline.t`. I need a
		# better solution.
		unless focus.from - 16 <= t <= focus.to

			newFrom = t

			newTo = newFrom + focus.duration

			if focus.to < t and newTo > @duration

				shift = newTo - @duration

				newTo = @duration

				newFrom -= shift

				if newFrom < 0 then newFrom = 0

			@model.changeFocusArea newFrom, newTo

			return

		do @_repositionSeeker

		return

	_repositionSeeker: ->

		curSeekerPos = @timelineEditor._timeToFocusedX @model.t

		@seeker
		.moveXTo(curSeekerPos)
		.set('left', curSeekerPos)

		return

	# in my defence:
	#
	# 		There are only two hard things in Computer Science:
	# 		cache invalidation and naming things.
	#
	# 		-- Phil Karlton
	#
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

	_dragSeekerToPos: (toPos) ->

		focus = @model.getFocusArea()

		t = @timelineEditor._XToFocusedTime toPos

		t = 0 if t < 0

		t = @duration if t > @duration

		@model.tick t

		return

	_repositionFocus: ->

		focus = @model.getFocusArea()

		left = @timelineEditor._timeToUnfocusedX focus.from

		@focusLeftNode
		.moveXTo(left)
		.set('left', left)

		right = @timelineEditor._timeToUnfocusedX focus.from + focus.duration

		@focusRightNode
		.moveXTo(right)
		.set('left', right)

		@focusStripNode
		.moveXTo(left)
		.css('width', (right - left) + 'px')

		return

	_updateDuration: ->

		@duration = @model.duration

		do @_repositionElements

	_seekToX: (toPos) ->

		focus = @model.getFocusArea()

		t = @timelineEditor._XToFocusedTime toPos

		t = 0 if t < 0

		t = @duration if t > @duration

		@model.tick t

		return

	_zoomFocus: (zoomMult, x) ->

		focus = @model.getFocusArea()

		pivotInDur = x / @_width

		newDuration = focus.duration * zoomMult

		if newDuration > @duration

			newFrom = 0

			newTo = @duration

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

		if newTo > @duration

			newTo = @duration

		newDur = newTo - newFrom

		@model.changeFocusArea newFrom, newTo

		return
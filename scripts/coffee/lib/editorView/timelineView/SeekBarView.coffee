Foxie = require 'foxie'

module.exports = class SeekbarView

	constructor: (@timeline) ->

		@clicks = @timeline.editor.clicks

		@model = @timeline.editor.model.timeControl

		window.addEventListener 'resize', => do @_resetSpace

		@timelineLength = @model.timelineLength

		@model.on 'length-change', => do @_updateTimelineLength

		do @_prepareNode

		do @_prepareSeeker

		do @_prepareFocus

		do @_resetSpace

	_prepareNode: ->

		@node = Foxie('.timeflow-seekbar')
		.putIn(@timeline.node)

	_prepareSeeker: ->

		@seeker = Foxie('.timeflow-seekbar-seeker')
		.moveZ(1)
		.putIn(@node)

		@model.on 'time-change', => do @_repositionSeeker

		wasPlaying = no

		@clicks.onDrag @seeker,

			start: =>

				document.body.style.cursor = getComputedStyle(@seeker.node).cursor

				wasPlaying = @model.isPlaying()

				@model.pause() if wasPlaying

			end: ->

				document.body.style.cursor = ''

				if wasPlaying then @model.play()

			drag: (absX, absY, relX) =>

				@_moveSeekerRelatively relX

		return

	_prepareFocus: ->

		do @_prepareFocusLeft

		do @_prepareFocusRight

		@model.on 'focus-change', => do @_repositionFocus

	_prepareFocusLeft: ->

		@focusLeftNode = Foxie('.timeflow-seekbar-focus-left')
		.moveZ(1)
		.trans(200)
		.set('left', 0)
		.putIn(@node)

		@clicks.onDrag @focusLeftNode,

			start: =>

				document.body.style.cursor = getComputedStyle(@focusLeftNode.node).cursor

			end: ->

				document.body.style.cursor = ''

			drag: (absX, absY, relX) =>

				@_moveFocusLeftInWindowSpace relX

	_prepareFocusRight: ->

		@focusRightNode = Foxie('.timeflow-seekbar-focus-right')
		.moveZ(1)
		.set('left', 0)
		.trans(200)
		.putIn(@node)

		@clicks.onDrag @focusRightNode,

			start: =>

				document.body.style.cursor = getComputedStyle(@focusRightNode.node).cursor

			end: ->

				document.body.style.cursor = ''

			drag: (absX, absY, relX) =>

				@_moveFocusRightInWindowSpace relX

	_moveFocusLeftInWindowSpace: (x) ->

		focus = @model.getFocusArea()

		curWinPos = @focusLeftNode.get('left')

		nextWinPos = curWinPos + x

		# the from part
		nextFrom = nextWinPos / @_space * @timelineLength

		if nextFrom < 0

			nextFrom = 0

		# if the seeker is before the new from
		if nextFrom > @model.t

			# put it on the new from
			@model.tick nextFrom

		# and the next to
		nextTo = focus.to

		if nextTo - nextFrom < 1000

			nextTo = nextFrom + 1000

		if nextTo > @timelineLength

			nextTo = @timelineLength

		# update the model
		@model.changeFocusArea nextFrom, nextTo

		# if seeker is after the new focused area
		if nextTo < @model.t

			# put it on the end of the new focused area
			@model.tick nextTo

		return

	_moveFocusRightInWindowSpace: (x) ->

		focus = @model.getFocusArea()

		curWinPos = @focusRightNode.get('left')

		nextWinPos = curWinPos + x

		# the to part
		nextTo = nextWinPos / @_space * @timelineLength

		if nextTo > @timelineLength

			nextTo = @timelineLength

		if nextTo < 1000

			nextTo = 1000

		# if the seeker is before the new from
		if @model.t > nextTo

			# put it on the new from
			@model.tick nextTo

		# and the next to
		nextFrom = focus.from

		if nextTo - nextFrom < 1000

			nextFrom = nextTo - 1000

		if nextFrom < 0

			nextFrom = 0

		# update the model
		@model.changeFocusArea nextFrom, nextTo

		# if seeker is after the new focused area
		if nextFrom > @model.t

			# put it on the end of the new focused area
			@model.tick nextFrom

		return

	_resetSpace: ->

		@_space = window.innerWidth - 8

		do @_repositionElements

	_repositionElements: ->

		do @_repositionSeeker

		do @_repositionFocus

	_repositionSeeker: ->

		t = @model.t

		focus = @model.getFocusArea()

		rel = (t - focus.from) / focus.duration

		curSeekerPos = parseInt @_space * rel

		@seeker
		.moveXTo(curSeekerPos)
		.set('left', curSeekerPos)

		return

	_moveSeekerRelatively: (x) ->

		toPos = @seeker.get('left') + x

		focus = @model.getFocusArea()

		t = (toPos / @_space * focus.duration) + focus.from

		t = 0 if t < 0

		t = @timelineLength if t > @timelineLength

		@model.tick t

		return

	_repositionFocus: ->

		focus = @model.getFocusArea()

		left = parseInt (focus.from / @timelineLength) * @_space

		@focusLeftNode
		.moveXTo(left)
		.set('left', left)

		right = parseInt ((focus.from + focus.duration) / @timelineLength) * @_space

		@focusRightNode
		.moveXTo(right)
		.set('left', right)

		return

	_updateTimelineLength: ->

		@timelineLength = @model.timelineLength

		do @_repositionElements
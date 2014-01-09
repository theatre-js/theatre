_Emitter = require '../_Emitter'

module.exports = class TimeControlModel extends _Emitter

	constructor: (@editor) ->

		super

		@timeFlow = @editor.timeFlow

		@timelineLength = 0

		@timeFlow.on 'length-change', =>

			do @_updateTimelineLength

			return

		do @_updateTimelineLength

		@t = 0

		@timeFlow.on 'tick', =>

			do @_updateT

			return

		@_focus = from: 0, to: 0, duration: 0

		do @_updateT

		@_isPlaying = no

		@_lastPlayedTickAt = 0

		@_shouldStartPlaying = no

		setTimeout =>

			@tick 0

		, 0

	_updateTimelineLength: ->

		@timelineLength = @timeFlow.timelineLength + 5000

		@_emit 'length-change'

		return

	_updateT: ->

		@t = @timeFlow.t

		t = @t

		# # while playing, we might have gone out of bounds
		# # of the focused area
		# unless @_focus.from <= t <= @_focus.to

		# 	newFrom = t

		# 	newTo = @_focus.to - @_focus.from + newFrom

		# 	if newTo > @timelineLength

		# 		newTo = @timelineLength

		# 	@changeFocusArea newFrom, newTo

		@_emit 'time-change'

		return

	tick: (t) ->

		unless 0 <= t <= @timelineLength

			throw Error "t is out of bounds"

		@timeFlow.tick t

		return

	tickOnSpot: ->

		@timeFlow.tick @timeFlow.t

		return

	changeFocusArea: (from, to) ->

		unless 0 <= from <= @timelineLength

			debugger

			throw Error "Wrong from"

		unless from <= to <= @timelineLength

			debugger

			throw Error "Wrong to"

		@_focus.from = from
		@_focus.to = to
		@_focus.duration = to - from

		@_emit 'focus-change'

		return

	getFocusArea: ->

		# if focus area is unchanged...
		if @_focus.duration is 0

			@_focus.to = @timelineLength
			@_focus.duration = @timelineLength

		@_focus

	_tick: (t) ->

		return unless @_isPlaying

		if @_shouldStartPlaying

			@_lastPlayedTickAt = t

			@_shouldStartPlaying = no

			return

		diff = t - @_lastPlayedTickAt

		@_lastPlayedTickAt = t

		@_tickByDiff diff

		return

	_tickByDiff: (diff) ->

		newT = @timeFlow.t + diff

		if newT > @timelineLength

			newT = @timelineLength

			@timeFlow.tick newT

			do @pause

			return

		@timeFlow.tick newT

		return

	isPlaying: ->

		@_isPlaying

	togglePlayState: ->

		if @_isPlaying

			do @pause

		else

			do @play

		return

	play: ->

		if @_isPlaying

			throw Error "Already  playing"

		@_isPlaying = yes

		@_shouldStartPlaying = yes

		@_emit 'play-state-change'

		return

	pause: ->

		unless @_isPlaying

			throw Error "Already paused"

		@_shouldStartPlaying = no

		@_isPlaying = no

		@_emit 'play-state-change'

		return

	seekBy: (amount) ->

		if @isPlaying()

			do @pause

		toT = @timeFlow.t + amount

		toT = 0 if toT < 0

		if toT > @timelineLength

			toT = @timelineLength

		@tick toT

		return

	jumpToBeginning: ->

		if @isPlaying()

			do @pause

		@tick 0

		return

	jumpToEnd: ->

		if @isPlaying()

			do @pause

		@tick @timelineLength

		return

	jumpToFocusBeginning: ->

		if @isPlaying()

			do @pause

		@tick @_focus.from + 1

		return

	jumpToFocusEnd: ->

		if @isPlaying()

			do @pause

		@tick @_focus.to - 1

		return
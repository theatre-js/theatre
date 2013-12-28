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

		@_zoom = position: 0, duration: 0

		do @_updateT

		@_isPlaying = no

		@_lastPlayedTickAt = 0

		@_shouldStartPlaying = no

	_updateTimelineLength: ->

		@timelineLength = @timeFlow.timelineLength + 5000

		@_emit 'length-change'

		return

	_updateT: ->

		@t = @timeFlow.t

		t = @t

		# readjust the zoom area
		if t < @_zoom.position or t > @_zoom.position + @_zoom.duration

			newPos = t - (@_zoom.duration / 2)

			if newPos < 0

				newPos = 0

			@changeZoomArea newPos, @_zoom.duration

		@_emit 'time-change'

		return

	tick: (t) ->

		@timeFlow.tick t

		return

	changeZoomArea: (position, duration) ->

		unless Number.isFinite(position) and position >= 0

			throw Error "Wrong position"

		unless Number.isFinite(duration) and duration >= 0

			throw Error "Wrong duration"

		@_zoom.position = position
		@_zoom.duration = duration

		@_emit 'zoom-change'

		return

	getZoomArea: ->

		# if zoom area is unchanged...
		if @_zoom.position is 0 and @_zoom.duration is 0

			@_zoom.duration = @timelineLength + 1000

		@_zoom

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

		@timeFlow.tick @timeFlow.t + diff

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

	seekForward: ->

		if @isPlaying()

			do @pause

		@seekbar.seekForward()

		return

	seekBackward: ->

		if @isPlaying()

			do @pause

		@seekbar.seekBackward()

		return
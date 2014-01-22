_DynamicModel = require '../_DynamicModel'

module.exports = class TimeControlModel extends _DynamicModel

	constructor: (@editor) ->

		@rootModel = @editor

		@_serializedAddress = 'timeControl'

		super

		@audio = @editor.audio

		@timeline = @editor.timeline

		# duration of the whole animation
		@duration = 0

		# when the duration of the audio track changes
		@audio.on 'duration-change', =>

			do @_recheckAudioDuration

		do @_recheckAudioDuration

		# when the duration of the timeline changes...
		@timeline.on 'duration-change', =>

			do @_recheckTimelineDuration

		do @_recheckTimelineDuration

		@audio.on 'play', => do @_updatePlayState
		@audio.on 'pause', => do @_updatePlayState
		@audio.on 'scheduled-to-play', => do @_updatePlayState

		# current time in milliseconds
		@t = 0

		# the focus area
		@_focus = from: 0, to: 0, duration: 0

		# when the audio ticks, we'll wire that to
		# our timeline...
		@audio.on 'tick', (t) => @timeline.tick t

		# ... and we update our time when the timeline ticks
		@timeline.on 'tick', => do @_updateT

		do @_updateT

		@_lastPlayedTickAt = 0

		setTimeout =>

			@tick 0

		, 0

	serialize: ->

		se = {}

		se.duration = @duration

		se.t = @t

		se._focus =

			from: @_focus.from
			to: @_focus.to

		se._lastPlayedTickAt = @_lastPlayedTickAt

		se

	_loadFrom: (se) ->

		do @pause

		@_setDuration Number se.duration

		@changeFocusArea se._focus.from, se._focus.to

		@tick Number se.t

		return

	# when the duration of our timeline changes...
	_recheckTimelineDuration: ->

		# ... report that to @audio. It'll then decide if
		# the duration of the whole animation should change
		@audio.maximizeDuration @timeline.duration + 5000

	# when the duration of @audio changes...
	_recheckAudioDuration: ->

		# ... remember the new duration
		@_setDuration @audio.duration

	# save the duration of the whole animation
	_setDuration: (@duration) ->

		@_emit 'duration-change'

		do @_reportLocalChange

		return

	# we update our local time based on the timeline's time
	_updateT: ->

		@t = @timeline.t

		@_emit 'time-change'

		do @_reportLocalChange

		return

	tick: (t) ->

		@audio.seekTo t

		return

	# to tick on spot...
	tickOnSpot: ->

		# ... we only force the timeline to tick.
		# There is no reason to bother @audio
		@timeline.tick @timeline.t

		return

	# change the focus area; we'll calculate the focus
	# duration ourself.
	changeFocusArea: (from, to) ->

		unless 0 <= from <= @duration

			debugger

			throw Error "Wrong from"

		unless from <= to <= @duration

			debugger

			throw Error "Wrong to"

		@_focus.from = from
		@_focus.to = to
		@_focus.duration = to - from

		@_emit 'focus-change'

		do @_reportLocalChange

		return

	# get the focus area...
	getFocusArea: ->

		# ... but if focus area is unchanged...
		if @_focus.duration is 0

			# ... then we should set it to view the whole timeline
			@_focus.to = @duration
			@_focus.duration = @duration

		@_focus

	# we receive ticks from the editor. ticks come from requestAnimationFrame,
	# and might be set to be in sync with other animation controllers outside
	# theatre.js
	_tick: (t) ->

		# we'll just wire the tick right to @audio
		@audio.tick t

		return

		diff = t - @_lastPlayedTickAt

		@_lastPlayedTickAt = t

		@_tickByDiff diff

		return

	_tickByDiff: (diff) ->

		newT = @timeline.t + diff

		if newT > @duration

			newT = @duration

			@timeline.tick newT

			do @pause

			return

		@timeline.tick newT

		return

	_updatePlayState: ->

		@_emit 'play-state-change'

	isPlaying: ->

		@audio.isPlaying()

	togglePlayState: ->

		@audio.togglePlay()

		return

	play: ->

		@audio.play()

		@_emit 'play-state-change'

		return

	pause: ->

		@audio.pause()

		@_emit 'play-state-change'

		return

	seekBy: (amount) ->

		@audio.seek amount

		return

	jumpToBeginning: ->

		@audio.seekTo 0

		return

	jumpToEnd: ->

		@audio.seekTo @duration

		return

	jumpToFocusBeginning: ->

		@audio.seekTo @_focus.from + 1

		return

	jumpToFocusEnd: ->

		@audio.seekTo @_focus.to - 1

		return
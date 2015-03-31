_Emitter = require '../_Emitter'

module.exports = class NoAudioTimeControl extends _Emitter
	constructor: ->
		super

		@_actualT = 0.0

		@_lastWindowTime = 0.0

		@duration = 0.0

		@_trackDuration = 0.0

		@_waitBeforePlay = 50

		@_isPlaying = no
		@_isSet = no
		@_offset = 0.0

		@_emit 'ready-state-change'

	setOffset: (offset) ->
		@_offset = +offset

	maximizeDuration: (duration) ->
		if duration isnt @duration
			@duration = duration
			@_emit 'duration-change'

		return

	isPlaying: ->
		@_isPlaying

	isReady: ->
		@_isReady

	_actualTToUserT: (actualT) ->
		actualT + @_offset

	_userTToActualT: (userT) ->
		userT - @_offset

	_setT: (actual) ->
		@_actualT = actual
		@t = @_actualTToUserT actual

	tick: ->
		return unless @_isPlaying

		currentWindowTime = performance.now()
		@_setT @_actualT + currentWindowTime - @_lastWindowTime
		@_lastWindowTime = currentWindowTime

		if @_actualT > @duration
			do @pause
			@seekTo 0.0

			return

		@_emit 'tick', @t

		return

	play: ->
		return if @_isPlaying

		do @_play

		return

	togglePlay: ->
		if @_isPlaying
			do @pause
		else
			do @play

	pause: ->
		return unless @_isPlaying
		@_isPlaying = no

		@_emit 'pause'

		return

	seekTo: (t) ->
		t = @_userTToActualT t

		if @_isPlaying
			wasPlaying = yes
			do @pause

		if t > @duration then t = @duration
		if t < 0 then t = 0.0

		@_setT t
		@_emit 'tick', @t

		if wasPlaying
			do @play

		return

	seek: (amount) ->
		@seekTo @t + amount

	_play: ->

		return if @_actualT > @duration

		@_lastWindowTime = performance.now()
		@_actualT -= @_waitBeforePlay

		@_isPlaying = yes
		@_emit 'play'

	isReady: ->
		yes
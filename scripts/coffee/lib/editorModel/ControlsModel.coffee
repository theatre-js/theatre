_Emitter = require '../_Emitter'

module.exports = class ControlsModel extends _Emitter

	constructor: (@editor) ->

		super

		@_isPlaying = no

		@_lastPlayedTickAt = 0

		@_shouldStartPlaying = no

		@timeFlow = @editor.timeFlow

	_tick: (t) ->

		return

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
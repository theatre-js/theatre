SplittedAudioTrackPart = require './splittedAudioTrack/SplittedAudioTrackPart'
_Emitter = require '../../_Emitter'
array = require 'utila/scripts/js/lib/array'
wn = require 'when'

module.exports = class SplittedAudioTrack extends _Emitter

	constructor: (@context, @config) ->

		super

		@node = @context.createGain()

		@node.connect @context.destination

		@duration = 0.0

		do @_preparePieces

		@_readyToPlayPromise = null

		@_isPlaying = no

		@t = 0

		@_waitBeforePlay = 0.016

		@_secondsToSchedulePartInAdvance = 1.0

		@_queuedParts = []

	_preparePieces: ->

		@_parts = []

		i = 0

		for partConfig in @config.parts

			break if i++ is 1

			@_addPart partConfig

		console.log @_parts

		return

	_addPart: (partConfig) ->

		part = new SplittedAudioTrackPart @, @_parts.length, partConfig

		@duration = @duration + part.duration

		@_parts.push part

	getReadyToPlay: ->

		unless @_readyToPlayPromise?

			d = wn.defer()

			@_readyToPlayPromise = d.promise

			remaining = @_parts.length

			for part in @_parts

				part.getReadyToPlay().then =>

					remaining--

					if remaining is 0 then d.resolve()

					return

		@_readyToPlayPromise

	play: ->

		return if @_isPlaying

		@_lastContextTime = @context.currentTime

		@t -= @_waitBeforePlay

		do @_queuePartsToPlay

		@_isPlaying = yes

	_queuePartsToPlay: ->

		for part in @_parts

			continue if part in @_queuedParts

			break if part.from - @_secondsToSchedulePartInAdvance > @t

			continue if part.to < @t

			@_queuedParts.push part

			part.queue()

		return

	_unqueuePart: (part) ->

		array.pluckOneItem @_queuedParts, part

		return

	tick: (t) ->

		return unless @_isPlaying

		contextTime = @context.currentTime

		@t = @t + contextTime - @_lastContextTime

		@_lastContextTime = contextTime

		if @t > @duration

			do @pause

			return

		for part in @_parts

			part.tick @t

		do @_queuePartsToPlay

		return

	pause: ->

		unless @_isPlaying

			throw Error "Already paused"

		do @_unqueueParts

		@_isPlaying = no

		console.log 'pausing'

	_unqueueParts: ->

		loop

			part = @_queuedParts.pop()

			break unless part?

			part.unqueue()

		return
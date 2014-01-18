SplittedAudioTrackPart = require './splittedAudioTrack/SplittedAudioTrackPart'
_Emitter = require '../../_Emitter'
{pad} = require 'utila/scripts/js/lib/string'
wn = require 'when'

module.exports = class SplittedAudioTrack extends _Emitter

	constructor: (@context, @src, @partsCount, @_tracksStartAt = 1) ->

		super

		@node = @context.createGain()

		@_remainingToLoad = 0

		@_isLoaded = no

		@_loadDeferred = wn.defer()

		@_isPlaying = no

		do @_preparePieces

		do @load

		@_getReadyToPlay 0

	_preparePieces: ->

		@_parts = []

		numWidth = String(@partsCount).length

		for i in [@_tracksStartAt...@_tracksStartAt + @partsCount]

			trackNum = pad i, numWidth

			trackAddress = @src.replace /(\[n\])/, trackNum

			@_addPart i, trackAddress

		return

	_addPart: (i, trackAddress) ->

		part = new SplittedAudioTrackPart @, trackAddress

		@_remainingToLoad++

		part.load().then =>

			@_remainingToLoad--

			if @_remainingToLoad is 0

				@_isLoaded = yes

				@_loadDeferred.resolve()

			return

		@_parts.push part

	load: ->

		@_loadDeferred.promise

	isLoaded: ->

		@_isLoaded

	tick: (t) ->

		return unless @_isLoaded

		return unless @_scheduledToPlay

		if @_isPlaying

			@_emit 'tick'

		else

			return unless @_isReadyToPlayTime @t

			i = @_getPartIndexForTime @t

			console.log i

			@_isPlaying = yes

			part = @_parts[i]

			source = part.getASource()

			source.connect @node

			source.start 0

			# console.log 'can play', part

	_pauseParts: ->

	play: ->

		return if @_isPlaying

		@_scheduledToPlay = yes

		@_emit 'play'

		return

	pause: ->

		return unless @_scheduledToPlay

		@_emit 'pause'

		@_scheduledToPlay = no

		do @_pauseParts

		return

	seekTo: (t) ->

		do @pause

		@t = t

		@_getReadyToPlay t

		@_emit 'tick'

		return

	_getReadyToPlay: (t) ->

		i = @_getPartIndexForTime t

		part = @_parts[i]

		part.getReadyToPlay().then =>

			@_reportReadyToPlay i

			return

	_reportReadyToPlay: (i) ->

		console.log i, 'is ready to play'

	_isReadyToPlayTime: (t) ->

		i = @_getPartIndexForTime t

		part = @_parts[i]

		part.isReadyToPlay()

	_getPartIndexForTime: (t) ->

		0
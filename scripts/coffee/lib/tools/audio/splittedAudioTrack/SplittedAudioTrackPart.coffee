wn = require 'when'

module.exports = class SplittedAudioTrackPart

	constructor: (@_root, @index, @config) ->

		@context = @_root.context

		@node = @context.createGain()

		@node.connect @_root.node

		@trackAddress = @config.trackAddress

		@_decodedBuffer = new ArrayBuffer(0)

		@duration = @config.duration

		@from = 0

		@to = 0

		if @hasPrevPart()

			@from = @getPrevPart().to

		@to = @from + @duration

		@length = @config.length|0

		@_hasDecoded = no

		@_decodeDeferred = wn.defer()

		@_scheduledToDecode = no

		do @getReadyToPlay

		@_currentSource = null

		@_queued = no

	getNextPart: ->

		@_root._parts[@index + 1]

	hasNextPart: ->

		@getNextPart()?

	getPrevPart: ->

		@_root._parts[@index - 1]

	hasPrevPart: ->

		@getPrevPart()?

	includesTime: (t) ->

		@from <= t <= @to

	_load: ->

		unless @_loadPromise?

			deferred = wn.defer()

			@_loadPromise = deferred.promise

			req = new XMLHttpRequest

			req.open 'GET', @trackAddress, yes

			req.responseType = 'arraybuffer'

			req.addEventListener 'load', (e) ->

				deferred.resolve req.response

				return

			req.send()

		@_loadPromise

	isReadyToPlay: ->

		@_hasDecoded

	getReadyToPlay: ->

		unless @_scheduledToDecode

			@_scheduledToDecode = yes

			@_load().then (encodedBuffer) =>

				@context.decodeAudioData encodedBuffer, (@_decodedBuffer) =>

					@_hasDecoded = yes

					@_decodeDeferred.resolve()

					return

				, (err) =>

					@_decodeDeferred.reject "Unable to decode #{@trackAddress}"

					return

		@_decodeDeferred.promise

	_createSource: ->

		s = @context.createBufferSource()

		s.buffer = @_decodedBuffer

		s

	queue: ->

		if @_queued

			throw Error "Part '#{@trackAddress}' is already queued"

		@_currentSource = @_createSource()

		@_currentSource.connect @node

		@_currentSource.start @_root._lastContextTime + (@from - @_root.t) - 0.000

		@_queued = yes

		console.log 'queued', @trackAddress, 'at', @_root.t

	tick: (t) ->

		return unless @_queued

		if t > @to

			@_queued = no

			@_root._unqueuePart @

			console.log 'unqueued', @trackAddress, 'at', @_root.t

		return

	unqueue: ->

		unless @_queued

			throw Error "Part '#{@trackAddress}' is already unqueued"

		@_queued = no

		@_currentSource.stop 0

		console.log 'unqueued by force', @trackAddress
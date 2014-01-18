wn = require 'when'

module.exports = class SplittedAudioTrackPart

	constructor: (@_root, @_addr) ->

		@context = @_root.context

		@_decodedBuffer = new ArrayBuffer(0)

		@_hasDecoded = no

		@_decodeDeferred = wn.defer()

		@_scheduledToDecode = no

		do @load

	load: ->

		unless @_loadPromise?

			deferred = wn.defer()

			@_loadPromise = deferred.promise

			req = new XMLHttpRequest

			req.open 'GET', @_addr, yes

			req.responseType = 'arraybuffer'

			req.addEventListener 'load', (e) ->

				deferred.resolve req.response

				return

			req.send()

		@_loadPromise

	getASource: ->

		# console.log @_decodedBuffer.length

		s = @context.createBufferSource()
		s.buffer = @_decodedBuffer

		s

	_getDecodedBuffer: ->

	isReadyToPlay: ->

		@_hasDecoded

	getReadyToPlay: ->

		unless @_scheduledToDecode

			@_scheduledToDecode = yes

			@load().then (encodedBuffer) =>

				@context.decodeAudioData encodedBuffer, (@_decodedBuffer) =>

					@_hasDecoded = yes

					@_decodeDeferred.resolve()

					return

				, (err) =>

					@_decodeDeferred.reject "Unable to decode #{@_addr}"

					return

		@_decodeDeferred.promise


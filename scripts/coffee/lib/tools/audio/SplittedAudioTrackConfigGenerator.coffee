wn = require 'when'
{pad} = require 'utila/scripts/js/lib/string'

module.exports = class SplittedAudioTrackConfigGenerator

	constructor: (@context, @src, @partsCount, @tracksStartAt = 1, @numWidth = null) ->

		@_decoded = 0

		@_generateDeferred = wn.defer()

		@_generatedConfig = {}

		do @_preparePieces

	generate: ->

		@_generateDeferred.promise.then => @_generatedConfig

	_preparePieces: ->

		@_parts = []

		@numWidth ?= String(@partsCount).length

		for i in [@tracksStartAt...@tracksStartAt + @partsCount]

			trackNum = pad i, @numWidth

			trackAddress = @src.replace /(\[n\])/, trackNum

			@_addPart i, trackAddress

		return

	_addPart: (i, trackAddress) ->

		part =

			trackAddress: trackAddress

		@_parts.push part

		@_loadTrack(trackAddress).then (encodedBuffer) =>

			console.log 'loaded', i

			@_decodeBuffer(encodedBuffer)

		.then (decodedBuffer) =>

			console.log 'decoded', i

			@_putMetadataFromBufferOn decodedBuffer, part

			@_decoded++

			do @_checkIfWeAreDone

			return

		return

	_checkIfWeAreDone: ->

		return unless @_decoded is @partsCount

		do @_generateConfig

		@_generateDeferred.resolve @_generatedConfig

	_generateConfig: ->

		@_generatedConfig.sampleRate = @context.sampleRate

		@_generatedConfig.parts = @_parts

		return

	_loadTrack: (addr) ->

		deferred = wn.defer()

		console.log addr

		req = new XMLHttpRequest

		req.open 'GET', addr, yes

		req.responseType = 'arraybuffer'

		req.addEventListener 'load', (e) ->

			deferred.resolve req.response

			return

		req.send()

		deferred.promise

	_decodeBuffer: (encodedBuffer) ->

		deferred = wn.defer()

		@context.decodeAudioData encodedBuffer, (decodedBuffer) ->

			deferred.resolve decodedBuffer

			return

		, (err) ->

			deferred.reject "Couldn't decode audio data"

			return

		deferred.promise

	_putMetadataFromBufferOn: (buffer, part) ->

		part.length = buffer.length
		part.duration = buffer.duration
		part.sampleRate = buffer.sampleRate
		part.numberOfChannels = buffer.numberOfChannels
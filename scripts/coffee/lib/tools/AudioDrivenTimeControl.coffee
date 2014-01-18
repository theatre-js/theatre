wn = require 'when'

module.exports = class AudioDrivenTimeControl

	constructor: (@context, @encodedBuffer) ->

		@_readyPromise = null

		@decodedBuffer = null

		console.log @encodedBuffer

	ready: ->

		unless @_readyPromise?

			d = wn.defer()

			@_readyPromise = d.promise

			size = 100 * 1024
			chunk = 1

			partial = new Uint8Array size

			encodedView = new Uint8Array @encodedBuffer, size * chunk, size * (chunk + 0)

			partial.set encodedView

			@context.decodeAudioData partial.buffer, (@decodedBuffer) =>

				d.resolve()

				return

			, (error) ->

				console.log 'error', error

				d.reject error

				return

		@_readyPromise

	play: ->

		console.time 'source'

		source = @context.createBufferSource()

		source.buffer = @decodedBuffer

		source.connect @context.destination

		source.start 0

		console.timeEnd 'source'

		return
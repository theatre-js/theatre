Emitter = require 'utila/scripts/js/lib/Emitter'

module.exports = class Model extends Emitter

	constructor: (@scrollableArea) ->

		super

		@timeFocus =

			start: 0
			length: 2000

	setTimeFocus: (start, length) ->

		@timeFocus.start = +start
		@timeFocus.length = +length

		@_emit 'timeFocus-change'
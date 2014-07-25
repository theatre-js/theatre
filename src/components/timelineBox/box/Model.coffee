Emitter = require 'utila/scripts/js/lib/Emitter'

module.exports = class BoxModel extends Emitter

	constructor: (@box) ->

		super

		@dims =

			type: "offset"

			left: 10
			right: 10
			bottom: 10
			height: 300
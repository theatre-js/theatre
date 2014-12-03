Emitter = require 'utila/lib/Emitter'

module.exports = class Model extends Emitter

	constructor: (@box) ->

		super

		# How the size and the position of the box is defined
		@dims =

			# Offset from each corner of the window. Currently only
			# supports offseting from left/right/bottom
			type: "offset"

			left: 10
			right: 10
			bottom: 10
			height: 300
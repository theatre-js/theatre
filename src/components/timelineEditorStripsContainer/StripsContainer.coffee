Strip = require './Strip'
PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class StripsContainer

	constructor: (@editor) ->

		@theatre = @editor.theatre

		@events = new PipingEmitter

		@_strips = []

	add: (name) ->

		strip = new Strip this, name

		@_strips.push strip

		@_reArrange()

		strip

	_reArrange: ->

		currentY = 0

		for strip in @_strips

			strip.setY currentY

			currentY += strip.getHeight()

		return
PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class BarModel

	constructor: ->
		@events = new PipingEmitter
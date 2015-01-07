PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class Model

	constructor: (@panner) ->

		@events = new PipingEmitter
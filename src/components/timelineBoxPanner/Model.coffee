Emitter = require 'utila/scripts/js/lib/Emitter'

module.exports = class Model extends Emitter

	constructor: (@panner) ->

		super
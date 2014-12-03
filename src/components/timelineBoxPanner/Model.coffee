Emitter = require 'utila/lib/Emitter
'

module.exports = class Model extends Emitter

	constructor: (@panner) ->

		super
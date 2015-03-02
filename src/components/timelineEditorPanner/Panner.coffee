View = require './View'

module.exports = class Panner

	constructor: (@editor) ->

		@theatre = @editor.theatre

		@view = new View @
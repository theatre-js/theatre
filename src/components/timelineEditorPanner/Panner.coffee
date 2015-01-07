Model = require './Model'
View = require './View'

module.exports = class Panner

	constructor: (@editor) ->

		@theatre = @editor.theatre

		@model = new Model @

		@view = new View @
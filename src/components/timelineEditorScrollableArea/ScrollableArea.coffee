View = require './View'
Model = require './Model'

module.exports = class ScrollableArea

	constructor: (@editor) ->

		@theatre = @editor.theatre

		@model = new Model @

		@view = new View @
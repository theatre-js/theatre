View = require './View'
Model = require './Model'

module.exports = class ScrollableArea

	constructor: (@box) ->

		@theatre = @box.theatre

		@model = new Model @

		@view = new View @
ScrollableArea = require './box/ScrollableArea'
Model = require './box/Model'
View = require './box/View'

module.exports = class Box

	constructor: (@manager, @id) ->

		@theatre = @manager.theatre

		# todo: validate @id

		@model = new Model @

		@view = new View @

		@scrollableArea = new ScrollableArea @
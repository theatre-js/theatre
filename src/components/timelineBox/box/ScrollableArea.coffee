View = require './scrollableArea/View'
Model = require './scrollableArea/Model'

module.exports = class ScrollableArea

	constructor: (@box) ->

		@model = new Model @

		@view = new View @
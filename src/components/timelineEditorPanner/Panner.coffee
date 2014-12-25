Model = require './Model'
View = require './View'

module.exports = class Panner

	constructor: (@box) ->

		@theatre = @box.theatre

		@model = new Model @

		@view = new View @
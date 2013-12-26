Actor = require './category/Actor'

module.exports = class Category

	constructor: (@structure, @name) ->

		@id = @structure.view.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new Actor @, name

		@actors[name]
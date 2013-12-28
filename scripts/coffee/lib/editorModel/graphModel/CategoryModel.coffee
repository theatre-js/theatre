ActorModel = require './categoryModel/ActorModel'

module.exports = class CategoryModel

	constructor: (@graph, @name) ->

		@id = @graph.editor.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new ActorModel @, name

		@actors[name]
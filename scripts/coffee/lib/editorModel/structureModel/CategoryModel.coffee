ActorModel = require './categoryModel/ActorModel'

module.exports = class CategoryModel

	constructor: (@structure, @name) ->

		@id = @structure.editor.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new ActorModel @, name

		@actors[name]
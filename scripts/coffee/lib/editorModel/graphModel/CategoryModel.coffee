ActorModel = require './categoryModel/ActorModel'

module.exports = class CategoryModel

	constructor: (@graph, @name) ->

		@id = @graph.editor.id + '-' + @name

		@actors = {}

	serialize: ->

		se = {}

		se.id = @id

		se.name = @name

		se.actors = actors = {}

		for name, actor of @actors

			actors[name] = actor.serialize()

		se

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new ActorModel @, name

		@actors[name]
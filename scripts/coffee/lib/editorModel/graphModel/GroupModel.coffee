ActorModel = require './groupModel/ActorModel'

module.exports = class GroupModel

	constructor: (@graph, @name) ->

		@id = @graph.editor.id + '-' + @name

		@actors = {}

	getActor: (name) ->

		unless @actors[name]?

			@actors[name] = new ActorModel @, name

		@actors[name]
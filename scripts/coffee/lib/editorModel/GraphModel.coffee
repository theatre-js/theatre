GroupModel = require './graphModel/GroupModel'

module.exports = class GraphModel

	constructor: (@editor) ->

		@categories = {}

		@_actorProps = {}

	getGroup: (name) ->

		unless @categories[name]?

			@categories[name] = cat = new GroupModel @, name

		@categories[name]

	getCategories: ->

		@categories

	_addActorProp: (id, actorProp) ->

		if @_actorProps[id]?

			throw Error "ActorProp with '#{id}' is already in the graph"

		@_actorProps[id] = actorProp

		return

	getActorPropById: (id) ->

		@_actorProps[id]
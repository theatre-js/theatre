ActorPropModel = require './actorModel/ActorPropModel'

module.exports = class ActorModel

	constructor: (@category, @name) ->

		@id = @category.id + '-' + @name

		@timeFlow = @category.graph.editor.timeFlow

		@props = {}

	addRegularProp: (name, arrayName, arrayIndex) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timeFlowProp = @timeFlow.addRegularProp(propId, arrayName, arrayIndex)

		@props[name] = prop = new ActorPropModel @, name, timeFlowProp

		prop
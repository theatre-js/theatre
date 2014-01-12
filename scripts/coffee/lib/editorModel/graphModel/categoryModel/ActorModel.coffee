ActorPropModel = require './actorModel/ActorPropModel'

module.exports = class ActorModel

	constructor: (@category, @name) ->

		@id = @category.id + '-' + @name

		@timeFlow = @category.graph.editor.timeFlow

		@props = {}

	addProp: (name, arrayName, arrayIndex) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timeFlowProp = @timeFlow.addProp(propId, arrayName, arrayIndex)

		@props[name] = prop = new ActorPropModel @, name, timeFlowProp

		prop

	useProp: (name, timeFlowProp) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		@props[name] = timeFlowProp

		@
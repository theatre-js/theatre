ActorPropModel = require './actorModel/ActorPropModel'

module.exports = class ActorModel

	constructor: (@group, @name) ->

		@graph = @group.graph

		@id = @group.id + '-' + @name

		@timeline = @group.graph.editor.timeline

		@props = {}

	addPropOfArray: (name, arrayName, arrayIndex) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timelineProp = @timeline.addPropOfArray(propId, arrayName, arrayIndex)

		@props[name] = prop = new ActorPropModel @, name, timelineProp

		prop

	addPropOfObject: (name, objectName, setter, getter) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timelineProp = @timeline.addPropOfObject(propId, objectName, setter, getter)

		@props[name] = prop = new ActorPropModel @, name, timelineProp

		prop

	useProp: (name, timelineProp) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		@props[name] = timelineProp

		@
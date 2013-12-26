ViewProp = require './actor/ViewProp'

module.exports = class Actor

	constructor: (@category, @name) ->

		@id = @category.id + '-' + @name

		@timeFlow = @category.structure.view.timeFlow

		@props = {}

	addRegularProp: (name, arrayName, arrayIndex) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timeFlowProp = @timeFlow.addRegularProp(propId, arrayName, arrayIndex)

		@props[name] = new ViewProp @, name, timeFlowProp
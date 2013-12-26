ViewProp = require './actor/ViewProp'
_Emitter = require '../../../_Emitter'

module.exports = class Actor extends _Emitter

	constructor: (@category, @name) ->

		super

		@id = @category.id + '-' + @name

		@timeFlow = @category.structure.view.timeFlow

		@props = {}

	addRegularProp: (name, arrayName, arrayIndex) ->

		if @props[name]?

			throw Error "prop with name '#{name}' already exists in actor '#{@id}'"

		propId = @id + '-' + name

		timeFlowProp = @timeFlow.addRegularProp(propId, arrayName, arrayIndex)

		@props[name] = prop = new ViewProp @, name, timeFlowProp

		@_emit 'new-prop', prop

		prop
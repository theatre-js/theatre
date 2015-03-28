GlobalClassDescriptor = require './globalClassesHolder/GlobalClassDescriptor'

module.exports = class GlobalClassesHolder
	constructor: (@_dee) ->
		@_descriptors = {}
		@_toInstantiateUponInit = []

	register: (id, cls) ->
		descriptor = new GlobalClassDescriptor id, cls
		@_descriptors[id] = descriptor

		if descriptor.isLazy() isnt true
			if @_dee.isInitialized()
				@instantiate id
			else
				@_toInstantiateUponInit.push descriptor

		return

	has: (id) ->
		@_descriptors[id]?

	instantiate: (id) ->
		descriptor = @_descriptors[id]

		unless descriptor?
			throw Error "Unkown global class '#{id}'"

		obj = Object.create descriptor.cls.prototype

		@_dee._globalObjects.register id, obj

		mapOfResolvedDepIds = {}
		mapOfResolvedDepIds[id] = true

		@_dee._resolveDepsAndInit descriptor, obj, mapOfResolvedDepIds, []

		obj

	initialize: ->
		loop
			break if @_toInstantiateUponInit.length is 0

			{id, cls} = @_toInstantiateUponInit.shift()

			continue if @_dee._globalObjects.has id

			@instantiate id

		return
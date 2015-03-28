LocalClassDescriptor = require './localClassesHolder/LocalClassDescriptor'

module.exports = class LocalClassesHolder
	constructor: (@_dee) ->
		@_descriptors = {}

	register: (id, cls) ->
		descriptor = new LocalClassDescriptor id, cls
		@_descriptors[id] = descriptor

	has: (id) ->
		@_descriptors[id]?

	instantiate: (id, mapOfResolvedDepIds, constructorArgs) ->
		descriptor = @_descriptors[id]

		unless descriptor?
			throw Error "Unkown local class `#{id}`"

		@_dee._instantiateLocalOrAttachment descriptor, mapOfResolvedDepIds, constructorArgs
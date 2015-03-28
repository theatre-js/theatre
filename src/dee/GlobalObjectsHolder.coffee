module.exports = class GlobalObjectsHolder
	constructor: (@_dee) ->
		@_objects = {}

	register: (id, obj) ->
		@_objects[id] = obj

	has: (id) ->
		@_objects[id]?

	get: (id) ->
		@_objects[id]
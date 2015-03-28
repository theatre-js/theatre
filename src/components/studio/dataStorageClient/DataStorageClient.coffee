SimpleJSONStorageInterface = require './SimpleJSONStorageInterface'

module.exports = class DataStorageClient
	@type: 'global'

	@_interfaces:
		'SIMPLE_JSON': SimpleJSONStorageInterface

	constructor: ->
		@_storageInterfaces = {}

	getStorage: (namespace, type) ->
		storage = @_storageInterfaces[namespace]

		if storage?
			if type isnt storage.type
				throw Error "Namespace '#{namespace}' exists, but it's not of type `#{type}`. It's `#{storage.type}`"
			return storage

		cls = DataStorageClient._interfaces[type]

		unless cls?
			throw Error "Storage type `#{type}` isn't defined."

		@_storageInterfaces[namespace] = storage = new cls this, namespace
		storage.type = type

		storage
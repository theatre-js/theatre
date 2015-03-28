{object} = require 'utila'

module.exports = class SimpleJSONStorageInterface
	constructor: ->
		@_data = {}

	set: (data) ->
		@_data = object.clone data

	get: ->
		@_data
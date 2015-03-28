module.exports = class PersistentModel
	constructor: (@_storage) ->
		@_setStateFromStorage()

	_setStateFromStorage: ->
		@_setState @_storage.get()

	_getState: ->
		@_state

	_setState: (state) ->
		throw Error "Model doesn't have a _setState() method"

	_saveChanges: ->
		@_storage.set @_getState()
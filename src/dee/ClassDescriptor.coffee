module.exports = class ClassDescriptor
	constructor: (@id, @cls) ->

	hasGlobalDeps: ->
		@cls.globalDeps?

	getGlobalDeps: ->
		@cls.globalDeps

	getLocalDeps: ->
		@cls.localDeps
GlobalObjectsHolder = require './dee/GlobalObjectsHolder'
GlobalClassesHolder = require './dee/GlobalClassesHolder'
LocalClassesHolder = require './dee/LocalClassesHolder'
AttachmentClassesHolder = require './dee/AttachmentClassesHolder'

module.exports = class Dee
	constructor: ->
		@_idsTaken = {}

		@_globalObjects = new GlobalObjectsHolder this
		@_globalClasses = new GlobalClassesHolder this
		@_localClasses = new LocalClassesHolder this
		@_attachmentClasses = new AttachmentClassesHolder this

		@_initalized = no

	isInitialized: ->
		@_initalized

	register: ->
		if typeof arguments[0] is 'string'
			@registerSingle arguments[0], arguments[1]
		else if typeof arguments[0] is 'object'
			@registerMulti arguments[0]

	registerMulti: (map) ->
		for id, obj of map
			@registerSingle id, obj

		return this

	registerSingle: (id, obj) ->
		if @_idsTaken[id]?
			throw Error "A component with id '#{id}' is already registered"

		@_idsTaken[id] = yes

		if obj instanceof Function
			@_registerClass id, obj
		else
			@_globalObjects.register id, obj

		return this

	_registerClass: (id, cls) ->
		switch cls.type
			when "local" then @_localClasses.register id, cls
			when "attachment" then @_attachmentClasses.register id, cls
			when "global" then @_globalClasses.register id, cls
			else throw Error "Component '#{id}' doesn't have a valid type: '#{cls.type}'"

		return

	initialize: ->
		return this if @_initalized
		@_initalized = yes

		@_globalClasses.initialize()

	_resolveGlobalDeps: (desc, obj) ->
		return unless desc.hasGlobalDeps()

		for depVarName, depId of desc.getGlobalDeps()
			if @_globalObjects.has depId
				obj[depVarName] = @_globalObjects.get depId
			else
				unless @_globalClasses.has depId
					throw Error "Unkown global component '#{depId}' required by '#{desc.id}'"

				obj[depVarName] = @_globalClasses.instantiate depId

		return

	get: (id) ->
		resolved = @_globalObjects.get id
		return resolved if resolved?

		@_globalClasses.instantiate id

	_resolveLocalDeps: (desc, obj, resolvedDeps) ->
		for name, depId of desc.getLocalDeps()
			if resolvedDeps[depId]?
				throw Error "Circular dependency between '#{depId}' and '#{desc.id}'"

			unless @_localClasses.has depId
				throw Error "Unkown local component '#{depId}'"

			obj[name] = @_localClasses.instantiate depId, resolvedDeps

		return

	instantiate: (id, ctorArgs = []) ->
		@_localClasses.instantiate id, {}, ctorArgs

	_instantiateLocalOrAttachment: (desc, resolvedDeps, ctorArgs = [], additionalProps = {}) ->
		{id} = desc
		if resolvedDeps[id]?
			throw Error "Circular dependency involving '#{id}'"

		resolvedDeps[id] = true

		obj = Object.create desc.cls.prototype

		for name, vr of additionalProps
			obj[name] = vr

		@_resolveDepsAndInit desc, obj, resolvedDeps, ctorArgs

		obj

	_resolveDepsAndInit: (desc, obj, resolvedDeps, ctorArgs = []) ->
		@_resolveGlobalDeps desc, obj

		@_resolveLocalDeps desc, obj, resolvedDeps

		obj.constructor = desc.cls
		desc.cls.apply obj, ctorArgs
		@_attachmentClasses.resolveAttachments desc, obj, resolvedDeps
		obj.initialize?()
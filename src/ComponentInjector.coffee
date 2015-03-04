LocalClass = require './componentInjector/LocalClass'
LeechClass = require './componentInjector/LeechClass'
GlobalClass = require './componentInjector/GlobalClass'

module.exports = class ComponentInjector
	constructor: ->
		@_idsTaken = {}
		@_instantiatedGlobals = {}
		@_localClasses = {}
		@_leechClasses = {}
		@_leechesByTarget = {}
		@_globalClasses = {}
		@_globalClassesToBeInstantiatedUponInitialization = []

		@_initalized = no

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
			@_registerInstantiatedGlobal id, obj

		return this

	_registerInstantiatedGlobal: (id, obj) ->
		@_instantiatedGlobals[id] = obj

	_registerClass: (id, cls) ->
		switch cls.type
			when "local" then @_registerLocalClass id, cls
			when "leech" then @_registerLeechClass id, cls
			when "global" then @_registerGlobalClass id, cls
			else throw Error "Component '#{id}' doesn't have a valid type: '#{cls.type}'"

	_registerLocalClass: (id, cls) ->
		@_localClasses[id] = new LocalClass id, cls

	_registerLeechClass: (id, cls) ->
		@_leechClasses[id] = descriptor = new LeechClass id, cls
		unless cls.target?
			throw Error "Leech component '#{id}' doesn't have a target"
		leechesAlreadyAttached = @_leechesByTarget[cls.target]
		unless leechesAlreadyAttached?
			@_leechesByTarget[cls.target] = leechesAlreadyAttached = {}
		leechesAlreadyAttached[id] = descriptor

	_registerGlobalClass: (id, cls) ->
		descriptor = new GlobalClass id, cls
		@_globalClasses[id] = descriptor

		if cls.lazy isnt yes
			if @_initalized
				@_instantiateGlobalClass id
			else
				@_globalClassesToBeInstantiatedUponInitialization.push descriptor

	initialize: ->
		return this if @_initalized
		@_initalized = yes

		@_instantiateGlobalClassesInQueue()

	_instantiateGlobalClassesInQueue: ->
		loop
			break if @_globalClassesToBeInstantiatedUponInitialization.length is 0
			{id, cls} = @_globalClassesToBeInstantiatedUponInitialization.shift()
			continue if @_instantiatedGlobals[id]?
			@_instantiateGlobalClass id
		return

	_instantiateGlobalClass: (id) ->
		descriptor = @_globalClasses[id]
		obj = Object.create descriptor.cls.prototype
		@_instantiatedGlobals[id] = obj

		mapOfResolvedDepIds = {}
		mapOfResolvedDepIds[id] = true
		@_resolveDependenciesAndInitialize descriptor, obj, mapOfResolvedDepIds, []
		obj

	_resolveGlobalDependencies: (descriptor, obj) ->
		return unless descriptor.cls.globalDeps?
		for name, depId of descriptor.cls.globalDeps
			if @_instantiatedGlobals[depId]?
				obj[name] = @_instantiatedGlobals[depId]
			else
				unless @_globalClasses[depId]?
					throw Error "Unkown global component '#{depId}' required by '#{descriptor.id}'"
				obj[name] = @_instantiateGlobalClass depId
		return

	get: (id) ->
		resolved = @_instantiatedGlobals[id]
		return resolved if resolved?

		if @_globalClasses[id]?
			return @_instantiateGlobalClass id
		else
			throw Error "Unkown global dependency `#{id}`"

	_resolveLocalDependencies: (descriptor, obj, mapOfResolvedDepIds) ->
		for name, depId of descriptor.cls.localDeps
			if mapOfResolvedDepIds[depId]?
				throw Error "Circular dependency between '#{depId}' and '#{descriptor.id}'"
			unless @_localClasses[depId]?
				throw Error "Unkown local component '#{depId}'"
			obj[name] = @_instantiateLocalClass depId, mapOfResolvedDepIds
		return

	instantiate: (id, constructorArgs = []) ->
		@_instantiateLocalClass(id, {}, constructorArgs)

	_instantiateLocalClass: (id, mapOfResolvedDepIds, constructorArgs) ->
		descriptor = @_localClasses[id]
		unless descriptor?
			throw Error "Unkown local class `#{id}`"
		@_instantiateLocalOrLeech descriptor, mapOfResolvedDepIds, constructorArgs

	_instantiateLocalOrLeech: (descriptor, mapOfResolvedDepIds, constructorArgs = [], additionalProps = {}) ->
		{id} = descriptor
		if mapOfResolvedDepIds[id]?
			throw Error "Circular dependency involving '#{id}'"
		mapOfResolvedDepIds[id] = true

		obj = Object.create descriptor.cls.prototype
		for name, vr of additionalProps
			obj[name] = vr
		@_resolveDependenciesAndInitialize descriptor, obj, mapOfResolvedDepIds, constructorArgs
		obj

	_resolveDependenciesAndInitialize: (descriptor, obj, mapOfResolvedDepIds, constructorArgs = []) ->
		@_resolveGlobalDependencies descriptor, obj
		@_resolveLocalDependencies descriptor, obj, mapOfResolvedDepIds
		descriptor.cls.apply obj, constructorArgs
		@_resolveLeeches descriptor, obj, mapOfResolvedDepIds
		obj.initialize?()

	_resolveLeeches: (targetDescriptor, targetObject, mapOfResolvedDepIds) ->
		leechDescriptors = @_leechesByTarget[targetDescriptor.id]
		return unless leechDescriptors?
		listOfLeechIds = for id of leechDescriptors then id
		deferredLeechIds = []
		instantiatedLeeches = []
		loop
			break if listOfLeechIds.length is 0
			leechId = listOfLeechIds.shift()
			leechDescriptor = leechDescriptors[leechId]
			if leechDescriptor.cls.peerDeps?
				shouldDefer = no
				for depName, peerLeechId of leechDescriptor.cls.peerDeps
					continue if instantiatedLeeches[peerLeechId]?
					unless peerLeechId in listOfLeechIds
						throw Error "Leech component '#{leechDescriptor.id}' needs to be peered with non-existing leech component '#{peerLeechId}'"
					shouldDefer = yes
					break

				if shouldDefer
					if leechId in deferredLeechIds
						throw Error "Looks like there is a circular dependency involving '#{leechId}'"
					listOfLeechIds.push leechId
					deferredLeechIds.push leechId
					continue

			additionalProps = {}
			if leechDescriptor.cls.peerDeps?
				for depName, peerLeechId of leechDescriptor.cls.peerDeps
					additionalProps[depName] = instantiatedLeeches[peerLeechId]

			leechObj = @_instantiateLeechClass leechId, targetDescriptor, targetObject, mapOfResolvedDepIds, additionalProps
			instantiatedLeeches[leechId] = leechObj

		return

	_instantiateLeechClass: (id, targetDescriptor, targetObject, mapOfResolvedDepIds, additionalProps) ->
		descriptor = @_leechClasses[id]
		@_instantiateLocalOrLeech descriptor, mapOfResolvedDepIds, [targetObject], additionalProps
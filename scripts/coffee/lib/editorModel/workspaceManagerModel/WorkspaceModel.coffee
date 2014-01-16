ActorPropModel = require '../graphModel/groupModel/actorModel/ActorPropModel'
_Emitter = require '../../_Emitter'
array = require 'utila/scripts/js/lib/array'
WorkspacePropHolderModel = require './workspaceModel/WorkspacePropHolderModel'

module.exports = class WorkspaceModel extends _Emitter

	self = @

	constructor: (@workspaceManager, @name) ->

		super

		@rootModel = @workspaceManager.rootModel

		@propHolders = []

	serialize: ->

		se = {}

		se.name = @name

		se.propHolders = propHolders = []

		propHolders.push p.serialize() for p in @propHolders

		se

	@constructFrom: (se, workspaceManager) ->

		ws = new self workspaceManager, se.name

		for propHolder in se.propHolders

			ws._constructPropHolderAndAdd propHolder

		ws

	_constructPropHolderAndAdd: (se) ->

		ph = WorkspacePropHolderModel.constructFrom se, @

		@_addPropHolder ph

	rename: (newName) ->

		return if newName is @name

		if @workspaceManager._getWorkspaceByName(newName)?

			throw Error "A workspace named '#{newName}' already exists"

		@name = newName

		@_emit 'rename'

		return

	remove: ->

		@workspaceManager._removeWorkspace @

		@_emit 'remove'

		@workspaceManager = null

		@name = 'REMOVED'

		return

	addProp: (actorPropModel) ->

		unless actorPropModel instanceof ActorPropModel

			throw Error "prop must be an instance of ActorPropModel"

		if @_getHolderPropById(actorPropModel.id)

			throw Error "Prop `#{prop.id}` already exists in #{@name}"

		@_addPropHolder propHolder = new WorkspacePropHolderModel @, actorPropModel

		return

	_addPropHolder: (propHolder) ->

		@propHolders.push propHolder

		propHolder.onAnyEvent => @_emit 'something-changed'

		@_emit 'new-prop', propHolder

	_getHolderPropById: (id) ->

		for prop in @propHolders

			return prop if prop.id is id

		return

	activate: ->

		@workspaceManager._activate @

		return

	isPropListed: (prop) ->

		@_getHolderPropById(prop.id)?

	removeProp: (prop) ->

		propHolder = @_getHolderPropById prop.id

		unless propHolder?

			throw Error "Prop `#{prop.id}` is not listed in #{@name}"

		array.pluckOneItem @propHolders, propHolder

		@_emit 'prop-remove', propHolder

		return

	_togglePropListing: (prop) ->

		if @isPropListed prop

			@removeProp prop

		else

			@addProp prop

		return
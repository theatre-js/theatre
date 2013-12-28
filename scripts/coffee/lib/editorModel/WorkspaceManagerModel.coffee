array = require 'utila/scripts/js/lib/array'
WorkspaceModel = require './workspaceManagerModel/WorkspaceModel'
_Emitter = require '../_Emitter'

module.exports = class WorkspaceManagerModel extends _Emitter

	constructor: (@editor) ->

		super

		@_workspaces = []

		@_propListingChangeListeners = {}

		@_active = null

	getAll: ->

		@_workspaces

	get: (name) ->

		workspace = @_getWorkspaceByName name

		unless workspace?

			@_workspaces.push workspace = new WorkspaceModel @, name

			@_emit 'new-workspace', workspace

		workspace

	_getWorkspaceByName: (name) ->

		name = String name

		if name.length < 3

			throw Error "Wrong name '#{name}' for a workspace"

		for workspace in @_workspaces

			return workspace if workspace.name is name

		return

	_removeWorkspace: (workspace) ->

		array.pluckOneItem @_workspaces, workspace

		return

	getActiveWorkspace: ->

		unless @_active?

			if @_workspaces.length isnt 0

				@_active = @_workspaces[0]

			else

				@_active = do @_makeEmptyWorkspace

		@_active

	_makeEmptyWorkspace: ->

		@get 'EMPTY'

	isPropListed: (propModel) ->

		ws = @getActiveWorkspace()

		ws.isPropListed propModel

	onPropListingChange: (propModel, cb) ->

		id = propModel.id

		unless @_propListingChangeListeners[id]?

			@_propListingChangeListeners[id] = [cb]

			return

		@_propListingChangeListeners[id].push cb

		return

	togglePropListing: (propModel) ->

		@getActiveWorkspace().togglePropListing propModel

		return
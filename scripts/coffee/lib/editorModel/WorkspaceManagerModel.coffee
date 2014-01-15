array = require 'utila/scripts/js/lib/array'
WorkspaceModel = require './workspaceManagerModel/WorkspaceModel'
_DynamicModel = require '../_DynamicModel'

module.exports = class WorkspaceManagerModel extends _DynamicModel

	constructor: (@editor) ->

		@rootModel = @editor

		@_serializedAddress = 'workspaces'

		super

		@rootModel = @editor

		@_workspaces = []

		@_propListingChangeListeners = {}

		@_active = null

		@onAnyEvent => do @_reportLocalChange

	serialize: ->

		se = {}

		se.workspaces = workspaces = []

		workspaces.push ws.serialize() for ws in @_workspaces when ws.name isnt 'EMPTY'

		se._activeWorkspaceName = ''

		if @_active?

			se._activeWorkspaceName = @_active.name

		se

	_loadFrom: (se) ->

		for ws in se.workspaces

			continue if ws.name is 'EMPTY'

			@_constructWorkspaceAndAdd ws

		if se._activeWorkspaceName isnt ''

			@get(se._activeWorkspaceName).activate()

		return

	getAll: ->

		@_workspaces

	_constructWorkspaceAndAdd: (se) ->

		workspace = WorkspaceModel.constructFrom se, @

		@_setupListenersOnWorkspace workspace

		@_addWorkspace workspace

	_makeWorkspace: (name) ->

		workspace = new WorkspaceModel @, name

		@_setupListenersOnWorkspace workspace

		workspace

	_setupListenersOnWorkspace: (workspace) ->

		workspace.onAnyEvent => do @_reportLocalChange

		workspace.on 'new-prop', (propHolder) =>

			if workspace is @_active

				@_emit 'prop-add', propHolder

				id = propHolder.id

				listeners = @_propListingChangeListeners[id]

				return unless listeners?

				for cb in listeners

					cb 'add'

			return

		workspace.on 'prop-remove', (propHolder) =>

			if workspace is @_active

				@_emit 'prop-remove', propHolder

				id = propHolder.id

				listeners = @_propListingChangeListeners[id]

				return unless listeners?

				for cb in listeners

					cb 'remove'

			return

		workspace.on 'rename', =>

			if workspace is @_active

				@_emit 'active-workspace-change', workspace

		workspace.on 'remove', =>

		return

	get: (name) ->

		workspace = @_getWorkspaceByName name

		unless workspace?

			@_addWorkspace workspace = @_makeWorkspace name

		workspace

	_addWorkspace: (workspace) ->

		@_workspaces.push workspace

		@_emit 'new-workspace', workspace

		do @_reportLocalChange

		return

	_getWorkspaceByName: (name) ->

		name = String name

		if name.length < 3

			throw Error "Wrong name '#{name}' for a workspace"

		for workspace in @_workspaces

			return workspace if workspace.name is name

		return

	_removeWorkspace: (workspace) ->

		array.pluckOneItem @_workspaces, workspace

		if @_active is workspace

			@_workspaces[0].activate()

		return

	getActiveWorkspace: ->

		unless @_active?

			if @_workspaces.length isnt 0

				@_workspaces[0].activate()

			else

				empty = do @_makeEmptyWorkspace

				empty.activate()

		@_active

	_makeEmptyWorkspace: ->

		@get 'EMPTY'

	isPropListed: (propModel) ->

		ws = @getActiveWorkspace()

		ws.isPropListed propModel

	onPropListingChange: (prop, cb) ->

		id = prop.id

		unless @_propListingChangeListeners[id]?

			@_propListingChangeListeners[id] = [cb]

			return

		@_propListingChangeListeners[id].push cb

		return

	togglePropListing: (prop) ->

		@getActiveWorkspace()._togglePropListing prop

		return

	_activate: (ws) ->

		active = @_active

		return if active is ws

		if active?

			for propModel in active.propHolders

				id = propModel.id

				listeners = @_propListingChangeListeners[id]

				continue unless listeners?

				for cb in listeners

					cb 'remove'

		@_active = ws

		for propModel in @_active.propHolders

			id = propModel.id

			listeners = @_propListingChangeListeners[id]

			continue unless listeners?

			for cb in listeners

				cb 'add'

		@_emit 'active-workspace-change'

		do @_reportLocalChange

		return

	getCurrentlyListedProps: ->

		@getActiveWorkspace().propHolders
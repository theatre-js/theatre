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

		# @_emit 'list-of-props-change'

		return

	getCurrentlyListedProps: ->

		@getActiveWorkspace().propHolders
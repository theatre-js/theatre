_Emitter = require './_Emitter'
GraphModel = require './editorModel/GraphModel'
MainBoxModel = require './editorModel/MainBoxModel'
Communicator = require './editorModel/Communicator'
TimelineModel = require './editorModel/TimelineModel'
TimeControlModel = require './editorModel/TimeControlModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'

module.exports = class EditorModel extends _Emitter

	constructor: (@id = 'timeFlow', @timeFlow) ->

		super

		@timeFlow.setRootModel @

		@graph = new GraphModel @

		@mainBox = new MainBoxModel @

		@workspaces = new WorkspaceManagerModel @

		@timeControl = new TimeControlModel @

		@timeline = new TimelineModel @

	_tick: (t) ->

		@timeControl._tick t

	serialize: ->

		se = {}

		se.id = @id

		se.timeFlow = @timeFlow.serialize()

		se.mainBox = @mainBox.serialize()

		se.workspaces = @workspaces.serialize()

		se.timeControl = @timeControl.serialize()

		se

	loadFrom: (se) ->

		@timeFlow.loadFrom se.timeFlow

		@mainBox.loadFrom se.mainBox

		@workspaces.loadFrom se.workspaces

		@timeControl.loadFrom se.timeControl

		@

	communicateWith: (server, namespace, password) ->

		if @communicator?

			throw Error "Editor '#{@id}' already has a communicator set up"

		@communicator = new Communicator @, server, namespace, password

		@

	run: ->

		if @_isRunning

			throw Error "Already running"

		@_isRunning = yes

		@_emit 'run'

		@

	isRunning: ->

		@_isRunning
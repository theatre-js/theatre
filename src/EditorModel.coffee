_Emitter = require './_Emitter'
SingleTrack = require 'audio-driven-time-control/lib/SingleTrack'
GraphModel = require './editorModel/GraphModel'
Communicator = require './editorModel/Communicator'
MainBoxModel = require './editorModel/MainBoxModel'
TimeControlModel = require './editorModel/TimeControlModel'
TimelineEditorModel = require './editorModel/TimelineEditorModel'
WorkspaceManagerModel = require './editorModel/WorkspaceManagerModel'

module.exports = class EditorModel extends _Emitter
  constructor: (@id = 'timeline', @timeline, @debug = no, @audio) ->
    super

    @timeline.setRootModel this

    @audio ?= new SingleTrack @id + '-audio'
    @graph = new GraphModel @
    @mainBox = new MainBoxModel @
    @workspaces = new WorkspaceManagerModel @
    @timeControl = new TimeControlModel @
    @timelineEditor = new TimelineEditorModel @

  _tick: (t) ->
    @timeControl._tick t

  serialize: ->
    se = {}
    se.id = @id
    se.timeline = @timeline.serialize()
    se.mainBox = @mainBox.serialize()
    se.workspaces = @workspaces.serialize()
    se.timeControl = @timeControl.serialize()
    se.timelineEditor = @timelineEditor.serialize()

    se

  loadFrom: (se) ->
    @timeline.loadFrom se.timeline if se.timeline?
    @mainBox.loadFrom se.mainBox if se.mainBox?
    @workspaces.loadFrom se.workspaces if se.workspaces?
    @timeControl.loadFrom se.timeControl if se.timeControl?
    @timelineEditor.loadFrom se.timelineEditor if se.timelineEditor?

    this

  communicateWith: (server, namespace, passphrase) ->
    if @communicator?
      throw Error "Editor '#{@id}' already has a communicator set up"

    @communicator = new Communicator @, server, namespace, passphrase
    this

  run: ->
    if @_isRunning
      throw Error "Already running"

    @_isRunning = yes
    @_emit 'run'
    this

  isRunning: ->
    @_isRunning
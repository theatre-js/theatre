Foxie = require 'foxie'
Moosh = require 'moosh'
Kilid = require 'kilid'
Asker = require './tools/Asker'
Chooser = require './tools/Chooser'
GraphView = require './editorView/GraphView'
MainBoxView = require './editorView/MainBoxView'
ControlsView = require './editorView/ControlsView'
CursorControl = require './tools/CursorControl'

module.exports = class EditorView
  constructor: (@model, @parentNode) ->
    @id = @model.id
    do @_prepareNode

    @cursor = new CursorControl
    @kilid = new Kilid(null, @id + '-kilid').getRootScope()
    @moosh = new Moosh document.body, @kilid
    @asker = new Asker @
    @chooser = new Chooser @
    @graph = new GraphView @
    @mainBox = new MainBoxView @
    @controls = new ControlsView @
    @model.on 'run', => do @_run

  tick: (t) =>
    @model._tick t
    return

  _prepareNode: ->
    @node = Foxie '.theatrejs'

    if navigator.product is 'Gecko' and navigator.platform is 'Win32'
      @node.addClass 'badFirefoxScrollbar'

    return

  _run: ->
    @node.putIn @parentNode
    do @graph.prepare
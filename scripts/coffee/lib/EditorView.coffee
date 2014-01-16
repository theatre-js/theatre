Foxie = require 'foxie'
Moosh = require 'moosh'
Kilid = require 'kilid'
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

		@moosh = new Moosh @node, @kilid

		@graph = new GraphView @

		@mainBox = new MainBoxView @

		@controls = new ControlsView @

		@model.on 'run', => do @_run

	tick: (t) =>

		@model._tick t

		return

	_prepareNode: ->

		@node = Foxie '.theatrejs'

		return

	_run: ->

		@node.putIn @parentNode

		do @graph.prepare
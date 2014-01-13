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

		@_prepared = no

	tick: (t) =>

		@model._tick t

		return

	_prepareNode: ->

		@node = Foxie '.timeflow'

		return

	prepare: ->

		if @_prepared

			throw Error "Already prepared"

		@node.putIn @parentNode

		do @graph.prepare

		@_prepared = yes


Moosh = require 'moosh'
Kilid = require 'kilid'
GraphView = require './editorView/GraphView'
EditorModel = require './EditorModel'
MainBoxView = require './editorView/MainBoxView'
ControlsView = require './editorView/ControlsView'

module.exports = class EditorView

	constructor: (@id, @parentNode) ->

		@model = new EditorModel @id

		do @_prepareNode

		@keys = new Kilid(null, @id + '-kilid').getRootScope()

		@clicks = new Moosh @node, @keys

		@graph = new GraphView @

		@mainBox = new MainBoxView @

		@controls = new ControlsView @

		@_prepared = no

	tick: (t) =>

		@model._tick t

		return

	_prepareNode: ->

		@node = document.createElement 'div'

		@node.classList.add 'timeflow'

		return

	prepare: ->

		if @_prepared

			throw Error "Already prepared"

		@parentNode.appendChild @node

		do @graph.prepare

		@_prepared = yes


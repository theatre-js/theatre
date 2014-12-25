TimelineEditorManager = require './components/timelineEditorManager/Manager'
CursorControl = require './tools/CursorControl'
El = require 'stupid-dom-interface'

Moosh = require 'moosh'
Kilid = require 'kilid'

module.exports = class Theatre

	constructor: ->

		@containerNode = El '.theatrejs'
		.inside document.body

		@kilid = new Kilid().getRootScope()

		@moosh = new Moosh document.body, @kilid

		@cursor = new CursorControl

		@timelineEditorManager = new TimelineEditorManager @
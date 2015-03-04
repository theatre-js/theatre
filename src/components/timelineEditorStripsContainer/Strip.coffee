El = require 'stupid-dom-interface'
PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class Bar

	constructor: (@list, @name) ->
		@events = new PipingEmitter
		@el = El '.strip'
		.inside @list.editor.scrollableArea.view.containerEl

		@setHeight 70
		@_y = 0

	setHeight: (@_height) ->
		@el.height @_height
		this

	getHeight: ->
		@_height

	setY: (@_y) ->
		@el.y @_y
		this
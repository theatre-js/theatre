El = require 'stupid-dom-interface'

module.exports = class GuidesPool

	constructor: (@manager) ->

		@_els = []

	_createEl: ->

		el = new El '.theatrejs-timelineEditor-guide'
		.inside @manager.editor.scrollableArea.view.containerNode

	pushEl: (el) ->

		@_els.push el.opacity 0

		return

	popEl: ->

		if @_els.length isnt 0 then return @_els.pop().opacity 1 else return @_createEl()

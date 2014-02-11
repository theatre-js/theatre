Foxie = require 'foxie'

module.exports = class GuideView

	constructor: (@guidesManager, @model) ->

		@timelineEditor = @guidesManager.timelineEditor

		do @_prepareNode

		@model.on 'remove', =>

			do @_remove

	_prepareNode: ->

		@node = Foxie '.theatrejs-timelineEditor-guides-guide'
		.putIn @guidesManager.node

		do @relay

	relay: ->

		@node.moveXTo @timelineEditor._timeToFocusedX @model.t

	_remove: ->

		@node.quit()

		@guidesManager._remove @
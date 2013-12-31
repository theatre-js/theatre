Foxie = require 'foxie'

module.exports = class TimelineView

	constructor: (@mainBox) ->

		@model = @mainBox.editor.model.timeline

		do @_prepareNode

	_prepareNode: ->

		@node = Foxie('.timeflow-timeline').putIn(@mainBox.node)
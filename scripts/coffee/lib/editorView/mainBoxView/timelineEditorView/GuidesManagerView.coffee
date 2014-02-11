Foxie = require 'foxie'
array = require 'utila/scripts/js/lib/array'
GuideView = require './guidesManagerView/GuideView'

module.exports = class GuidesManagerView

	constructor: (@timelineEditor) ->

		@model = @timelineEditor.model.guides

		@rootView = @timelineEditor.rootView

		@timeControlModel = @timelineEditor.mainBox.editor.model.timeControl

		do @_prepareNode

		do @_prepareGuides

		@_list = []

		@rootView.kilid.on 'ctrl+space', =>

			@model.toggle @timeControlModel.t

	_prepareNode: ->

		@node = Foxie '.theatrejs-timelineEditor-guides'
		.putIn @timelineEditor.node

	_prepareGuides: ->

		for guideModel in @model._list

			@_add guideModel

		@model.on 'new-guide', (guideModel) =>

			@_add guideModel

		return

	_add: (guideModel) ->

		@_list.push new GuideView @, guideModel

	relay: ->

		for guideView in @_list

			guideView.relay()

		return

	_remove: (guideView) ->

		array.pluckOneItem @_list, guideView
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

		@rootView.kilid.on 'ctrl+shift+space', =>

			do @_askMultipleGuidesQuestions

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

	_askMultipleGuidesQuestions: ->

		@rootView.asker.ask

			question: 'Spacing: (Example: \'200 1800\')'

			validate: (v) -> v.match /[0-9\s]+/

			cb: (success, spacing) =>

				return unless success

				@rootView.asker.ask

					question: 'How many?'

					validate: 'number'

					cb: (success, count) =>

						return unless success

						@_multipleGuides spacing, count

	_multipleGuides: (spacing, count) ->

		return unless spacing.match /^[0-9\s]+$/

		spaces = spacing.split(/\s+/).map (v) -> parseInt v

		count = parseInt count

		t = @timeControlModel.t

		for i in [0...count]

			for s in spaces

				t += s

				@model.add t

		return
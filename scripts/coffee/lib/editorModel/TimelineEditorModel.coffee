_DynamicModel = require '../_DynamicModel'
array = require 'utila/scripts/js/lib/array'

module.exports = class TimelineEditorModel extends _DynamicModel

	constructor: (@editor) ->

		@rootModel = @editor

		@_serializedAddress = 'timelineEditor'

		super

		@workspaces = @editor.workspaces

		@timeControl = @editor.timeControl

		@focusArea = @timeControl.getFocusArea()

		@timeControl.on 'focus-change', =>

			@focusArea = @timeControl.getFocusArea()

			@_emit 'focus-change'

		@workspaces.on 'active-workspace-change', => do @_relist

		@workspaces.on 'prop-add', (propHolder) => @_add propHolder

		@workspaces.on 'prop-remove', (propHolder) => @_remove propHolder

		@currentProps = []

		@scrollTop = 0

	serialize: ->

		se = scrollTop: @scrollTop

		se

	_loadFrom: (se) ->

		if se.scrollTop?

			@scrollTop = se.scrollTop|0

		return

	_setScrollTopFromUser: (scrollTop) ->

		@scrollTop = scrollTop|0

		do @_reportLocalChange

		return

	_setScroll: (scrollTop) ->

		@_setScrollTopFromUser scrollTop

		@_emit 'scroll-change'

	tick: ->

		@timeControl.tickOnSpot()

		return

	_relist: ->

		newProps = @workspaces.getCurrentlyListedProps()

		while @currentProps.length > 0

			@_remove @currentProps[0]

		for propHolder in newProps

			@_add propHolder

		return

	_add: (propHolder) ->

		@currentProps.push propHolder

		@_emit 'prop-add', propHolder

		return

	_remove: (propHolder) ->

		array.pluckOneItem @currentProps, propHolder

		@_emit 'prop-remove', propHolder

		return
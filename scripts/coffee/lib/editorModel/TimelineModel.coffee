_Emitter = require '../_Emitter'
array = require 'utila/scripts/js/lib/array'

module.exports = class TimelineModel extends _Emitter

	constructor: (@editor) ->

		super

		@workspaces = @editor.workspaces

		@timeControl = @editor.timeControl

		@focusArea = @timeControl.getFocusArea()

		@timeControl.on 'focus-change', =>

			@focusArea = @timeControl.getFocusArea()

			@_emit 'focus-change'

		@workspaces.on 'active-workspace-change', => do @_relist

		@workspaces.on 'prop-add', (propHolder) => @_add propHolder

		@workspaces.on 'prop-remove', => (propHolder) => @_remove propHolder

		@currentProps = []

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
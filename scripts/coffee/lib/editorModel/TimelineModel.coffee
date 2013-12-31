_Emitter = require '../_Emitter'

module.exports = class TimelineModel extends _Emitter

	constructor: (@editor) ->

		super

		@workspaces = @editor.workspaces

		@timeControl = @editor.timeControl

		# @_emit 'list-change'
		# @_emit 'focus-change'

	getListOfProps: ->


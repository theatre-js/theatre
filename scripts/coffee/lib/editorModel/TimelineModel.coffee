_Emitter = require '../_Emitter'
SeekbarModel = require './timelineModel/SeekbarModel'

module.exports = class TimelineModel extends _Emitter

	constructor: (@editor) ->

		super

		@seekbar = new SeekbarModel @

	isVisible: ->

		yes
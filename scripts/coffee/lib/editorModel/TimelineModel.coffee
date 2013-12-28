_Emitter = require '../_Emitter'
SeekBarModel = require './timelineModel/SeekBarModel'

module.exports = class TimelineModel extends _Emitter

	constructor: (@editor) ->

		super

		@seekbar = new SeekBarModel @

	isVisible: ->

		yes
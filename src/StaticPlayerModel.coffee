GraphModel = require './editorModel/GraphModel'
SingleTrack = require 'audio-driven-time-control/lib/SingleTrack'
DynamicTimeline = require './DynamicTimeline'
TimeControlModel = require './editorModel/TimeControlModel'

module.exports = class StaticPlayerModel

	constructor: (@id = 'timeline', @timeline, @timelineData, @audio) ->

		@timeline.setRootModel @

		@audio ?= new SingleTrack @id + '-audio'

		@graph = new GraphModel @

		@timeControl = new TimeControlModel @, 0

		@_ran = no

	tick: (t) =>

		@timeControl._tick t

	run: ->

		return if @_ran

		@_ran = yes

		@timeline.loadFrom @timelineData

		@
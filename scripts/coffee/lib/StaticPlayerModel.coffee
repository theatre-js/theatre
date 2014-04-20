GraphModel = require './editorModel/GraphModel'
DynamicTimeline = require './DynamicTimeline'
TimeControlModel = require './editorModel/TimeControlModel'
UnfancyAudioDrivenTimeControl = require 'audio-driven-time-control/scripts/js/lib/UnfancyAudioDrivenTimeControl'

module.exports = class StaticPlayerModel

	constructor: (@id = 'timeline', @timeline, @timelineData) ->

		@timeline.setRootModel @

		@audio = new UnfancyAudioDrivenTimeControl @id + '-audio'

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
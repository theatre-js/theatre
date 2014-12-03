ChronologyContainer = require './bezierPacs/ChronologyContainer'

module.exports = class BezierPacs

	constructor: ->

		@_chronology = new ChronologyContainer

		@_haveDataChanges = no
		@_committingDataChangesHeldOff = no

		@_committingAnimChangesHeldOff = no
		@_haveAnimChanges = no

		@_animChangeRange = {from: Infinity, to: -Infinity}

	###*
	 * Holds off on committing the data changes that should be
	 * sent to the server for now. Call commitDataChanges() to
	 * stop holding off the changes.
	 *
	 * call comitDataChanges() to stop holding off and update the server.
	###
	holdOffOnCommittingDataChanges: ->

		@_committingDataChangesHeldOff = yes

	###*
	 * Sends data changes to the data server. If committing data changes is held off,
	 * it'll stop holding them off.
	###
	commitDataChanges: ->

		@_committingDataChangesHeldOff = no

		#TODO: actually commit

	###*
	 * Holds off on committing animation changes (so the scene won't update if individual
	 * items are changed). This is useful when you wanna do multiple changes to the chronology
	 * before updating the scene.
	 *
	 * call comitAnimChanges() to stop holding off and update the scene.
	###
	holdOffOnCommittingAnimChanges: ->

		@_committingAnimChangesHeldOff = yes

	###*
	 * Applies changes in each individual item to the scene.
	###
	commitAnimChanges: ->

		@_committingAnimChangesHeldOff = no

		@_animChangeRange.from = Infinity
		@_animChangeRange.to = -Infinity

		#TODO: actually commit

	###*
	 * This'll report any changes in individual items. It's supposed to be called be
	 * called by each individual item.
	 *
	 * If committing changes (either data or anim) is held off, it'll just remember
	 * that there are changes, and it won't commit anything.
	 *
	 * @param  {Float64} from Change range from
	 * @param  {Float64} to   Change range to
	###
	_reportChange: (from, to) ->

		# Sometimes we might not have changes in animation, but just in data,
		# so let's allow such cases to be valid
		if from?

			@_haveAnimChanges = yes

			@_animChangeRange.from = Math.min(@_animChangeRange.from, from)
			@_animChangeRange.to = Math.min(@_animChangeRange.to, to)

			do @commitAnimChanges unless @_committingAnimChangesHeldOff

		@_haveDataChanges = yes

		do @commitDataChanges unless @_committingDataChangesHeldOff
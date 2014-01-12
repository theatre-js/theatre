module.exports = class ActorPropModel

	constructor: (@actor, @name, @timeFlowProp) ->

		@id = @actor.id + '-' + @name

	serialize: ->

		se = {}

		se.id = @id

		se.name = @name

		se.tiemFlowPropId = @timeFlowProp.id

		se
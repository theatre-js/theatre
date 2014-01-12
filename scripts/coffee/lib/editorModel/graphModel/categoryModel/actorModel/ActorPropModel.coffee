module.exports = class ActorPropModel

	constructor: (@actor, @name, @timeFlowProp) ->

		@id = @actor.id + '-' + @name

		@actor.graph._addActorProp @id, @
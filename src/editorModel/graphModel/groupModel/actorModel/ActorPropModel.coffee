module.exports = class ActorPropModel

	constructor: (@actor, @name, @timelineProp) ->

		@id = @actor.id + '-' + @name

		@actor.graph._addActorProp @id, @
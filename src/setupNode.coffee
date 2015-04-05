El = require './tools/DomInterface'

module.exports = (theatre, groupName, actorName, el, props = []) ->
	if !(theatre?) or !(theatre.graph?) or !(theatre.timeline?)
		throw Error "Invalid theatre object."

	if typeof groupName isnt 'string' or groupName.length is 0
		throw Error "Argument 1 (groupName) must be a string. Given: '#{groupName}'"

	if typeof actorName isnt 'string' or actorName.length is 0
		throw Error "Argument 1 (actorName) must be a string. Given: '#{actorName}'"

	unless Array.isArray(props)
		throw Error "Last argument (props) must either be an array of strings or null"

	# Ensure el is instance of DomInterface
	el = El el
	# Create a name for the el object
	objName = String(groupName + ' ' + actorName).replace(/\s+/g, '-').toLowerCase()
	# Add the el object to the timeline
	theatre.timeline.addObject objName, el

	# Retrieve the actor
	actor = theatre.graph.getGroup(groupName).getActor(actorName)

	hasCustomProps = Array.isArray(props) and props.length > 0

	if not hasCustomProps or 'opacity' in props
		actor.addPropOfObject 'Opacity', objName, 'opacity', 1

	if not hasCustomProps or 'rotation' in props
		actor.addPropOfObject 'Rotation X', objName, 'rotateX', 0
		actor.addPropOfObject 'Rotation Y', objName, 'rotateY', 0
		actor.addPropOfObject 'Rotation Z', objName, 'rotateZ', 0

	else
		if 'rotationX' in props
			actor.addPropOfObject 'Rotation X', objName, 'rotateX', 0

		if 'rotationY' in props
			actor.addPropOfObject 'Rotation Y', objName, 'rotateY', 0

		if 'rotationZ' in props
			actor.addPropOfObject 'Rotation Z', objName, 'rotateZ', 0

	if not hasCustomProps or 'translation' in props
		actor.addPropOfObject 'X', objName, 'x', 0
		actor.addPropOfObject 'Y', objName, 'y', 0
		actor.addPropOfObject 'Z', objName, 'z', 0

	else if 'xy' in props
		actor.addPropOfObject 'X', objName, 'x', 0
		actor.addPropOfObject 'Y', objName, 'y', 0

	else
		if 'x' in props
			actor.addPropOfObject 'X', objName, 'x', 0

		if 'y' in props
			actor.addPropOfObject 'Y', objName, 'y', 0

		if 'z' in props
			actor.addPropOfObject 'Z', objName, 'z', 0

	if 'localTranslation' in props
		actor.addPropOfObject 'Local X', objName, 'localX', 0
		actor.addPropOfObject 'Local Y', objName, 'localY', 0
		actor.addPropOfObject 'Local Z', objName, 'localZ', 0

	if 'transformOrigin' in props
		actor.addPropOfObject 'Transform Origin X', objName, 'transformOriginX', 0
		actor.addPropOfObject 'Transform Origin Y', objName, 'transformOriginY', 0
		actor.addPropOfObject 'Transform Origin Z', objName, 'transformOriginZ', 0

	if not hasCustomProps or 'scale' in props
		actor.addPropOfObject 'Scale X', objName, 'scaleX', 1
		actor.addPropOfObject 'Scale Y', objName, 'scaleY', 1
		actor.addPropOfObject 'Scale Z', objName, 'scaleZ', 1

	if 'scaleAll' in props
		actor.addPropOfObject 'Scale', objName, 'scale', 1

	if 'skew' in props
		actor.addPropOfObject 'Skew X', objName, 'skewX', 0
		actor.addPropOfObject 'Skew Y', objName, 'skewY', 0

	if 'dims' in props
		actor.addPropOfObject 'Width', objName, 'width', 0
		actor.addPropOfObject 'Height', objName, 'height', 0

	actor
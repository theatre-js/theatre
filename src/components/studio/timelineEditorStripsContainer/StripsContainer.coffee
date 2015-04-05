module.exports = class StripsContainer
	@type: 'attachment'
	@target: 'studio-timelineView'
	@globalDeps: {'moosh'}

	constructor: (@_timelineView) ->
		@_timelineView.strips = this

	getContainers: -> # [StripContainer]
	getContainerByIndex: -> # StripContainer
	createContainer: -> # StripContainer
	addContainer: (container: Container, onIndex: Int?) ->
	addContainerById: (containerId : Int, onIndex: Int?) ->
	setContainers: (containers: [Container]) ->
	setContainersById: (ids: [Int]) ->
	removeContainerById: ->
	clear: ->


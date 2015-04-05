TimelineViewManagerModel = require './TimelineViewManagerModel'
TimelineViewManagerPresenter = require './TimelineViewManagerPresenter'

module.exports = class TimelineViewManager
	@type: 'global'
	@globalDeps:
		studio: 'studio'
		componentInjector: 'componentInjector'
		_storageClient: 'studio-dataStorageClient'

	constructor: ->
		@_prepareModel()

	initialize: ->
		@studio.timelineViews = this

		@_model.append '45'
		@_model.set [2, 5, 45]

	_prepareModel: ->
		storage = @_storageClient.getStorage 'studio-timelineViewManager', 'SIMPLE_JSON'
		storage.set 'listOfTimelineViewNumbers': [0, 2, 1, 5]

		@_model = new TimelineViewManagerModel

		@_model.setState storage.get()

		@_model.events.on 'state:didChange', =>
			storage.set @_model.getState()

		@_presenter = new TimelineViewManagerPresenter
		@_presenter.setModel @_model


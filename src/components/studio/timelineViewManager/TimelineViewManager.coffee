TimelineViewManagerModel = require './TimelineViewManagerModel'
TimelineViewManagerPresenter = require './TimelineViewManagerPresenter'

module.exports = class TimelineViewManager
	@type: 'global'
	@globalDeps:
		studio: 'studio'
		componentInjector: 'componentInjector'
		_storageClient: 'studio-dataStorageClient'

	constructor: ->
		modelStorage = @_storageClient.getStorage 'studio-timelineViewManager', 'SIMPLE_JSON'
		modelStorage.set 'listOfTimelineViewNumbers': [0, 2, 1, 5]

		@_model = new TimelineViewManagerModel modelStorage
		@_presenter = new TimelineViewManagerPresenter
		@_presenter.setModel @_model

	initialize: ->
		@studio.timelineViews = this

		@_model.append '45'
		@_model.set [2, 5, 45]
module.exports = class TimelineEditorManager
	@type: 'global'
	@globalDeps:
		studio: 'studio'
		componentInjector: 'componentInjector'

	initialize: ->
		@editors = {}
		@studio.timelineEditorManager = this

	addEditor: (name, editor) ->
		if @editors[name]?
			throw Error "A TimeloneEditor named '#{name}' already exists"

		unless editor?
			editor = @componentInjector
			.instantiate('studio-timelineEditor', [this, name])

		@editors[name] = editor

		editor
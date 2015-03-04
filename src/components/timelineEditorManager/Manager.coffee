module.exports = class TimelineEditorManager
	@instantiable: no
	@globalDeps:
		studio: 'studio'
		di: 'di'

	initialize: ->
		@editors = {}
		@studio.timelineEditorManager = this

	addEditor: (name, editor) ->
		if @editors[name]?
			throw Error "A TimeloneEditor named '#{name}' already exists"

		unless editor?
			editor = @di
			.instantiate('studio-timelineEditor', [this, name])
			.setName(name)

		@editors[name] = editor

		editor
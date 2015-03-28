module.exports = class StripsContainer
	@type: 'leech'
	@target: 'studio-timelineEditor'
	@globalDeps: {'moosh'}

	constructor: (@editor) ->
		@editor.stripsContainer = this
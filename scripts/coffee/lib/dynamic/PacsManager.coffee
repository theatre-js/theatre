# Pacs: Points and Connectors
module.exports = class PacsManager

	constructor: (@tf) ->

	addSampleBeziers: ->

		@tf._beziers.push

			prop: 'p1x'
			fromT: 1
			fromVal: 10

			toT: 100
			toVal: 150

		@tf._beziers.push

			prop: 'p1x'
			fromT: 200
			fromVal: -150

			toT: 400
			toVal: 150

		@
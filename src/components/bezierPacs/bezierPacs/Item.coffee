PipingEmitter = require 'utila/lib/PipingEmitter'

module.exports = class Item

	constructor: ->

		@_idInPacs = null

		@_time = 0

		@_pacs = null

		@_sequence = null

		@events = new PipingEmitter

	getTime: ->

		@_time

	getRecognizedBy: (pacs) ->

		pacs.recognizeItem @

		@

	getUnrecognized: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.unrecognizeItem @

		@

	getInSequence: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.putItemInSequence @

		@

	getOutOfSequence: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.takeItemOutOfSequence()

		@

	getItemBefore: ->

		@_pacs.
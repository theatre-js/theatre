PipingEmitter = require 'utila/lib/PipingEmitter'

###*
 * Items give a very basic interface to interact with the their position in time
 * and their other attributes. They don't try to be smart. If you create a point
 * in the middle of two connected points, it's not gonna create another Their operations are
 * not undoable. Some other
 * @type {[type]}
###
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

		pacs.recognizeItem this

		@

	_receiveRecognition: (@_pacs, @_idInPacs) ->

		@events._emit 'recognition'

	getUnrecognized: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.unrecognizeItem this

		@

	_receiveUnrecognition: ->

		@_pacs = null
		@_idInPacs = null

		@events._emit 'unrecognition'

	getInSequence: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.putItemInSequence this

		@

	getOutOfSequence: ->

		unless @_pacs?

			throw Error "Item isn't recognized by any Pacs yet."

		@_pacs.takeItemOutOfSequence this

		@

	eliminate: ->

		do @getOutOfSequence

		do @getUnrecognized
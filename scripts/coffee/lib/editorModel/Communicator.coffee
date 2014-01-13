ConnectionToServer = require './communicator/ConnectionToServer'

module.exports = class Communicator

	constructor: (@model, @_server, @_namespaceName, @_password) ->

		@connection = new ConnectionToServer @
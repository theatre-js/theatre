_DynamicModel = require '../_DynamicModel'

module.exports = class MainBoxModel extends _DynamicModel
  constructor: (@editor) ->
    super

    @_serializedAddress = 'mainBox'
    @rootModel = @editor
    @height = 400
    @_isVisible = yes

  isVisible: -> @_isVisible

  setVisibility: (newVisibility) ->
    newVisibility = Boolean newVisibility
    return if newVisibility is @_isVisible

    @_isVisible = newVisibility
    @_emit 'visibility-toggle'
    do @_reportLocalChange

  toggleVisibility: ->
    @setVisibility not @_isVisible
    return

  serialize: ->
    se = height: @height, _isVisible: @_isVisible
    se

  _loadFrom: (se) ->
    @setHeight se.height
    @setVisibility Boolean se._isVisible
    return

  setHeight: (newH) ->
    return if @height is newH
    @height = newH
    @_emit 'height-change'
    do @_reportLocalChange
    return
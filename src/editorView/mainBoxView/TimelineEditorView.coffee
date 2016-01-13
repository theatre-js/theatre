Foxie = require 'foxie'
array = require 'utila/lib/array'
PropViewRepo = require './timelineEditorView/PropViewRepo'
SelectionManager = require './timelineEditorView/SelectionManager'
GuidesManagerView = require './timelineEditorView/GuidesManagerView'
fn = require '../../tools/fn'

module.exports = class TimelineEditorView
  constructor: (@mainBox) ->
    @model = @mainBox.editor.model.timelineEditor
    @editorModel = @mainBox.editor.model
    @rootView = @mainBox.rootView
    @focusArea = @model.focusArea
    timeControlModel = @mainBox.editor.model.timeControl
    @duration = timeControlModel.duration

    @selectionManager = new SelectionManager @

    timeControlModel.on 'duration-change', =>
      @duration = timeControlModel.duration

    @width = @mainBox.width
    @mainBox.on 'width-change', => @width = @mainBox.width
    @model.on 'scroll-change', => do @_updateScrollTopFromModel

    @_repo = new PropViewRepo @
    @_currentProps = []

    do @_prepareNode

    @guides = new GuidesManagerView @

    do @_relayHorizontally
    do @_prepareListeners

    @_firstPropAdded = no
    @_prepareScrollCache()

  _prepareListeners: ->
    @mainBox.on 'width-change', => do @_relayHorizontally
    @model.on 'focus-change', => do @_relayHorizontally
    @model.on 'prop-add', (propHolder) => @_add propHolder
    @model.on 'prop-remove', (propHolder) => @_remove propHolder

  _prepareNode: ->
    @node = Foxie('.theatrejs-timelineEditor').putIn(@mainBox.node)

    @node.node.addEventListener 'scroll', =>
      @model._setScrollTopFromUser @node.node.scrollTop

    @rootView.moosh.onMiddleDrag(@node)
    .withNoKeys()
    .onDown =>
      @rootView.cursor.use '-webkit-grabbing'
      @rootView.cursor.use '-moz-grabbing'

    .onDrag (e) =>
      @mainBox.seekbar._dragFocusBy -e.relX
      @_dragScrollBy -e.relY

    .onUp =>
      @rootView.cursor.free()

    .onCancel =>
      @rootView.cursor.free()

    @rootView.moosh.onClick(@node)
    .withNoKeys()
    .onDone (e) =>
      @mainBox.seekbar._seekToX e.layerX

    @rootView.moosh.onDrag(@node)
    .withNoKeys()
    .onDown =>
      @rootView.cursor.use 'ew-resize'

    .onDrag (e) =>
      @mainBox.seekbar._seekToX e.layerX

    .onUp =>
      @rootView.cursor.free()

    .onCancel =>
      @rootView.cursor.free()


    @rootView.moosh.onWheel(@node)
    .withKeys('shift')
    .onWheel (e) =>
      @mainBox.seekbar._zoomFocus 1 + (-e.delta / 120 / 8), e.layerX

    @rootView.moosh.onWheel(@node)
    .withNoKeys()
    .onWheel (e) =>
      if e.originalEvent.ctrlKey
        @mainBox.seekbar._zoomFocus 1 + (-e.delta / 120 / 8 / 5), e.layerX
      else
        @mainBox.seekbar._dragFocusBy e.originalEvent.deltaX
        @_dragScrollBy e.originalEvent.deltaY

      e.preventDefault()

  _prepareScrollCache: ->
    update = => setTimeout @updateScrollCache, 200
    update = fn.throttle update, 200

    @editorModel.mainBox.on 'height-change', update
    @model.on 'prop-add', update
    @model.on 'prop-remove', update

    update()

  updateScrollCache: =>
    @_maxScroll = @node.node.scrollHeight - @node.node.getBoundingClientRect().height

  _updateScrollTopFromModel: ->
    t = @model.scrollTop|0

    if t < 0
      @model._setScroll 0
      return

    if t > @_maxScroll
      @model._setScroll @_maxScroll
      return

    @node.node.scrollTop = t

  _dragScrollBy: (amount) ->
    @model._setScroll @model.scrollTop + amount

  _add: (propHolder) ->
    unless @_firstPropAdded
      setTimeout =>
        do @_updateScrollTopFromModel
      , 50

      @_firstPropAdded = yes


    propView = @_repo.getPropViewFor propHolder
    @_currentProps.push propView

    do propView.attach
    return

  _remove: (propHolder) ->
    for propView in @_currentProps
      if propView.id is propHolder.id
        propViewToRemove = propView

    unless propViewToRemove?
      throw Error "Couldn't find prop '#{propHolder.id}' in the current props list"

    array.pluckOneItem @_currentProps, propViewToRemove
    do propViewToRemove.detach
    return

  _relayHorizontally: ->
    @width = @mainBox.width
    @_widthToTimeRatio = @width / @focusArea.duration
    prop.relayHorizontally() for prop in @_currentProps
    @guides.relay()
    return

  _tick: ->
    @model.tick()
    return

  _XToTime: (x) ->
    x / @_widthToTimeRatio

  _XToFocusedTime: (x) ->
    @_XToTime(x) + @focusArea.from

  _unfocusedXToTime: (x) ->
    x / @width * @duration

  _timeToUnfocusedX: (t) ->
    parseInt @width * (t / @duration)

  _timeToFocusedX: (t) ->
    parseInt @width * (t - @focusArea.from) / @focusArea.duration

  _timeToX: (t) ->
    t * @_widthToTimeRatio
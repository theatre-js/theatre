import * as T from './types'
import MirrorOfReactTree, {
  VolatileId,
  isTextNode,
  isWrapperNode,
  isGenericNode,
  Node,
} from './MirrorOfReactTree'
import delay from '$shared/utils/delay'
import boxAtom from '$shared/DataVerse/deprecated/atoms/boxAtom'
import immer from 'immer'

type SummaryNode =
  | {type: 'Text'; text: string}
  | {
      type: 'Generic'
      tag: string
      id: string | undefined
      children: SummaryNode[]
    }
  | {type: 'Wrapper'; children: SummaryNode[]}

interface SummarisedTree extends Array<SummaryNode> {}

const summarise = (mirror: MirrorOfReactTree): SummarisedTree => {
  const rendererIds = Object.keys(mirror.getState().renderers)
  if (rendererIds.length > 1) {
    throw new Error(`Got more than one renderer. Can't handle that atm`)
  }
  const rendererId = rendererIds[0]
  const renderer = mirror.getState().renderers[rendererId]
  return renderer.volatileIdsOfRootNodes.map(summariseNode.bind(null, mirror))
}

const summariseNode = (
  mirror: MirrorOfReactTree,
  volatileId: VolatileId,
): SummaryNode => {
  const state = mirror.getState()
  const node = state.nodesByVolatileId[volatileId]
  if (!node) {
    debugger
    throw new Error(
      `Cannot find volatileId ${volatileId}. This should never happen`,
    )
  }

  if (isTextNode(node)) {
    return text(node.text)
  } else if (isWrapperNode(node)) {
    return wrapper(
      node.volatileIdsOfChildren.map(summariseNode.bind(null, mirror)),
    )
  } else if (isGenericNode(node)) {
    return generic(
      node.reactSpecific.internalData.name as string,
      node.reactSpecific.internalData.props.id,
      node.volatileIdsOfChildren.map(summariseNode.bind(null, mirror)),
    )
  } else {
    // debugger
    throw new Error('Implement me')
  }
}

const generic = (
  tag: string,
  id: string | undefined,
  children: SummaryNode[],
): SummaryNode => ({
  type: 'Generic',
  tag,
  id,
  children,
})

const wrapper = (children: SummaryNode[]): SummaryNode => ({
  type: 'Wrapper',
  children,
})

const text = (text: string): SummaryNode => ({
  type: 'Text',
  text,
})

// const summariseRenderer

describe(`mirror`, () => {
  /**
   * The way we are able to mirror the tree of react elements is by using the global
   * hook that react-devtools provides, window.__REACT_DEVTOOLS_GLOBAL_HOOK__ (aka theHook),
   * which is later picked up by react and communicated with.
   *
   * Since theHook is a value set on window, we need to reset it every time a test case runs.
   * Also, since React only instruments theHook once, we also need to reset the react module
   * for every test case. All of that happens in the before/afterEach blocks.
   */

  // References to React and ReactDOM, which are reset for every test case
  let React: T.React
  let ReactDOM: T.ReactDOM
  // alias for window.__REACT_DEVTOOLS_GLOBAL_HOOK__ (aka theHook)
  let theHook: T.Hook
  // the #root node in <body><div id="root"></div>/body>
  let rootEl: Element

  beforeEach(() => {
    window.shouldDebug = false
    jest.resetModules()
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined
    const installReactDevtoolsGlobalHook = require('$root/vendor/react-devtools-backend/installGlobalHook')
    installReactDevtoolsGlobalHook(window)
    const setupBackend = require('$root/vendor/react-devtools-backend/backend')
    setupBackend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

    theHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__

    React = require('react')
    ReactDOM = require('react-dom')
    document.body.innerHTML = '<div id="root"></div>'
    rootEl = document.getElementById('root') as $IntentionalAny
  })

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(rootEl)
  })

  describe(`the testing setup`, () => {
    // Here we are ensuring that theHook is actually set up and picked up by React.
    const fn = () => {
      expect(Object.keys(theHook._renderers)).toHaveLength(1)
      expect(Object.keys(theHook.helpers)).toHaveLength(1)

      ReactDOM.render(<div />, rootEl)
    }

    it(
      `should ensure that only one renderer instance is set up on __REACT_DEVTOOLS_GLOBAL_HOOK__`,
      fn,
    )
    // We run it twice to make sure the hook is only instrumented once (and thus we have no leaks).
    it(`let's test the same thing again`, fn)
    // These checks are only run once. If you sense a leak, try moving them to before/afterEach blocks
    // to ensure they run for every test case.
  })

  it(`picks up els even if the mirror is set up after ReactDOM mounts`, () => {
    const FunctionalComp = ({children}: {children: React.ReactNode}) => (
      <>
        <div id="childOfFunctionalComp">
          {children} childTextOfFunctionalComp
        </div>
        hi
      </>
    )
    class ClassComp extends React.Component<$IntentionalAny, $IntentionalAny> {
      render() {
        return (
          <div id="childOfClassComp">{[null, '>>', this.props.children]}</div>
        )
      }
    }
    ReactDOM.render(
      <div id="root">
        <ClassComp>
          <FunctionalComp>
            <a id="aWithArrayForTextChildren">{['aChild1', 'aChild2', null]}</a>
          </FunctionalComp>
        </ClassComp>
      </div>,
      rootEl,
    )

    // ensure mounting is done right away
    expect(rootEl.childNodes).toHaveLength(1)

    const m = new MirrorOfReactTree()
    m.flushEvents()
    const s = summarise(m)

    expect(s).toMatchObject([
      wrapper([
        generic('div', 'root', [
          generic('ClassComp', undefined, [
            generic('div', 'childOfClassComp', [
              text('>>'),
              generic('FunctionalComp', undefined, [
                generic('div', 'childOfFunctionalComp', [
                  generic('a', 'aWithArrayForTextChildren', [
                    text('aChild1'),
                    text('aChild2'),
                  ]),
                  text(' childTextOfFunctionalComp'),
                ]),
                text('hi'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ])

    m._cleanup()
  })

  describe(`updates/unmounts`, () => {
    it.only(`a bunch of test cases`, async () => {
      const b = boxAtom<React.ReactNode | React.ReactNode[]>('pending')

      class ClassComp extends React.Component<
        $IntentionalAny,
        $IntentionalAny
      > {
        state = {t: 'pending'}
        constructor(props: any) {
          super(props)
          b.changes().tap(t => this.setState({t}))
        }
        render() {
          return <div id="container">{this.state.t}</div>
        }
      }

      ReactDOM.render(<ClassComp />, rootEl)

      const m = new MirrorOfReactTree()

      const check = (children: SummaryNode[], numberOfChildren: number) => {
        const expectation = [
          wrapper([
            generic('ClassComp', undefined, [
              generic('div', 'container', children),
            ]),
          ]),
        ]
        m.flushEvents()
        // ensure the tree matches expectation
        expect(summarise(m)).toMatchObject(expectation)
        // ensure discarded nodes are removed from m._nodesByVolatileId
        expect(Object.keys(m.getState().nodesByVolatileId).length).toEqual(
          3 + numberOfChildren,
        )
      }

      check([text('pending')], 1)

      b.set('resolved')
      m.flushEvents()
      check([text('resolved')], 1)
      return

      b.set(['1', '2'])
      m.flushEvents()
      check([text('1'), text('2')], 2)

      b.set(['1', '2'])
      m.flushEvents()
      check([text('1'), text('2')], 2)

      b.set(['1'])
      m.flushEvents()
      check([text('1')], 1)

      b.set([<a id="blah" key="blah" />])
      m.flushEvents()
      check([generic('a', 'blah', [])], 1)

      ReactDOM.unmountComponentAtNode(rootEl)
      m.flushEvents()
      expect(Object.keys(m.getState().nodesByVolatileId).length).toEqual(0)

      ReactDOM.render(<ClassComp />, rootEl)
      m.flushEvents()
      expect(Object.keys(m.getState().renderers)).toHaveLength(1)

      const anotherRootEl = document.createElement('div')
      anotherRootEl.id = 'anotherRootEl'
      document.body.appendChild(anotherRootEl)
      ReactDOM.render(<ClassComp />, anotherRootEl)
      await delay(20)
      m.flushEvents()
      expect(Object.keys(m.getState().renderers)).toHaveLength(1)

      m._cleanup()
    })
  })
  describe(`walkTree`, () => {
    it(`should work`, () => {
      ReactDOM.render(
        <div id="parent">
          <div id="child1">
            <div id="ancestor1" />
            <div id="ancestor2" />
          </div>
          <div id="child2" />
        </div>,
        rootEl,
      )

      const m = new MirrorOfReactTree()
      const spy = jest.fn()
      m.flushEvents()
      m.walk(spy)
      const [firstCall, ...otherCalls]: $IntentionalAny = spy.mock.calls.map(
        (args: [Node]) => args[0],
      )
      expect(firstCall.type).toEqual('Wrapper')
      expect(otherCalls).toHaveLength(5)
      expect(otherCalls[0].nativeNode.id).toEqual('parent')
      expect(otherCalls[1].nativeNode.id).toEqual('child1')
      expect(otherCalls[2].nativeNode.id).toEqual('ancestor1')
      expect(otherCalls[3].nativeNode.id).toEqual('ancestor2')
      expect(otherCalls[4].nativeNode.id).toEqual('child2')
    })
  })
})

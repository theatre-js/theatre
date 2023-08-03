import {button, initialize, types, useControls} from 'theatric'
import {render} from 'react-dom'
import React, {useState} from 'react'
import state from './state.json'

void initialize({state})

function SomeComponent({id}: {id: string}) {
  const {foo, $get, $set} = useControls(
    {
      foo: 0,
      bar: 0,
      bez: button(() => {
        $set((p) => p.foo, 2)
        $set((p) => p.bar, 3)
        console.log($get((p) => p.foo))
      }),
    },
    {folder: id},
  )

  return (
    <div>
      {id}: {foo}
    </div>
  )
}

function App() {
  const {bar, $set, $get} = useControls({
    bar: {foo: 'bar'},
    baz: button(() => console.log($get((p) => p.bar))),
  })

  const {another, panel, col, yo} = useControls(
    {
      another: '',
      panel: '',
      yo: types.number(0),
      col: types.rgba(),
    },
    {panel: 'My panel'},
  )

  const {} = useControls({})

  const [showComponent, setShowComponent] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* <div>{JSON.stringify(bar)}</div> */}
      <SomeComponent id="first" />
      <SomeComponent id="second" />
      <button
        onClick={() => {
          setShowComponent(!showComponent)
        }}
      >
        Show another component
      </button>
      <button
        onClick={() => {
          $set((p) => p.bar.foo, $get((p) => p.bar.foo) + 1)
        }}
      >
        Increment stuff
      </button>
      {showComponent && <SomeComponent id="hidden" />}
      {yo}
      {JSON.stringify(col)}
    </div>
  )
}

render(<App />, document.getElementById('root'))

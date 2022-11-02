import studio from '@theatre/studio'
import type {UseDragOpts} from './useDrag'
import useDrag from './useDrag'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {IProject, ISheet} from '@theatre/core'
import {onChange, types} from '@theatre/core'
import type {IScrub, IStudio} from '@theatre/studio'
import type {ShorthandCompoundPropsToInitialValue} from '@theatre/core/propTypes/internals'

const textInterpolate = (left: string, right: string, progression: number) => {
  if (!left || right.startsWith(left)) {
    const length = Math.floor(
      Math.max(0, (right.length - left.length) * progression),
    )
    return left + right.slice(left.length, left.length + length)
  }
  return left
}

const globalConfig = {
  background: {
    type: types.stringLiteral('black', {
      black: 'black',
      white: 'white',
      dynamic: 'dynamic',
    }),
    dynamic: types.rgba(),
  },
}

const boxObjectConfig = {
  test: types.string('Hello?', {interpolate: textInterpolate}),
  testLiteral: types.stringLiteral('a', {a: 'Option A', b: 'Option B'}),
  bool: types.boolean(false),
  favoriteFood: types.compound({
    name: types.string('Pie'),
    // if needing more compounds, consider adding weight with different units
    price: types.compound({
      currency: types.stringLiteral('USD', {USD: 'USD', EUR: 'EUR'}),
      amount: types.number(10, {range: [0, 1000], label: '$'}),
    }),
  }),
  x: types.number(200),
  y: types.number(200),
  color: types.rgba({r: 1, g: 0, b: 0, a: 1}),
}

// this can also be inferred with
type _State = ShorthandCompoundPropsToInitialValue<typeof boxObjectConfig>
type State = {
  x: number
  y: number
  test: string
  testLiteral: string
  bool: boolean
  // a compound compound prop
  favoriteFood: {
    name: string
    price: {
      amount: number
      currency: string
    }
  }
  color: {
    r: number
    g: number
    b: number
    a: number
  }
}

const Box: React.FC<{
  id: string
  sheet: ISheet
  selection: IStudio['selection']
}> = ({id, sheet, selection}) => {
  const defaultConfig = useMemo(
    () =>
      Object.assign({}, boxObjectConfig, {
        // give the box initial values offset from each other
        x: ((id.codePointAt(0) ?? 0) % 15) * 100,
        y: ((id.codePointAt(0) ?? 0) % 15) * 100,
      }),
    [id],
  )

  // This is cheap to call and always returns the same value, so no need for useMemo()
  const obj = sheet.object(id, defaultConfig)

  const isSelected = selection.includes(obj)

  const boxRef = useRef<HTMLDivElement>(null!)
  const preRef = useRef<HTMLPreElement>(null!)
  const colorRef = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(obj.props, (newValues) => {
      boxRef.current.style.transform = `translate(${newValues.x}px, ${newValues.y}px)`
      preRef.current.innerText = JSON.stringify(newValues, null, 2)
      colorRef.current.style.background = newValues.color.toString()
    })
    return unsubscribeFromChanges
  }, [])

  const dragOpts = useMemo((): UseDragOpts => {
    let scrub: IScrub | undefined
    let initial: typeof obj.value
    let firstOnDragCalled = false
    return {
      onDragStart() {
        scrub = studio.scrub()
        initial = obj.value
        firstOnDragCalled = false
      },
      onDrag(x, y) {
        if (!firstOnDragCalled) {
          studio.setSelection([obj])
          firstOnDragCalled = true
        }
        scrub!.capture(({set}) => {
          set(obj.props, {
            ...initial,
            x: x + initial.x,
            y: y + initial.y,
          })
        })
      },
      onDragEnd(dragHappened) {
        if (dragHappened) {
          scrub!.commit()
        } else {
          scrub!.discard()
        }
      },
      lockCursorTo: 'move',
    }
  }, [])

  useDrag(boxRef.current, dragOpts)

  return (
    <div
      onClick={() => {
        studio.setSelection([obj])
      }}
      ref={boxRef}
      style={{
        width: 300,
        height: 300,
        color: 'white',
        position: 'absolute',
        boxSizing: 'border-box',
        border: isSelected ? '1px solid #5a92fa' : '1px solid white',
      }}
    >
      <pre style={{margin: 0, padding: '1rem'}} ref={preRef}></pre>
      <div
        ref={colorRef}
        style={{
          height: 50,
        }}
      />
    </div>
  )
}

let lastBoxId = 1

export const Scene: React.FC<{project: IProject}> = ({project}) => {
  const [boxes, setBoxes] = useState<Array<string>>(['0', '1'])

  // This is cheap to call and always returns the same value, so no need for useMemo()
  const sheet = project.sheet('Scene', 'default')
  const [selection, setSelection] = useState<IStudio['selection']>()

  useLayoutEffect(() => {
    return studio.onSelectionChange((newState) => {
      setSelection(newState)
    })
  })

  const containerRef = useRef<HTMLDivElement>(null!)
  const pathRef = useRef<SVGPathElement>(null!)

  const globalObj = sheet.object('global', globalConfig)

  useLayoutEffect(() => {
    const unsubscribeFromChanges = onChange(globalObj.props, (newValues) => {
      containerRef.current.style.background =
        newValues.background.type !== 'dynamic'
          ? newValues.background.type
          : newValues.background.dynamic.toString()
    })
    return unsubscribeFromChanges
  }, [globalObj])

  const testObj = sheet.object(
    'interp2',
    {
      t: types.number(0, {range: [0, 1]}),
    },
    {override: true},
  )

  const [state, setState] = useState({cx: 293, cy: 23})

  const testObj2 = sheet.object(
    'path',
    {'0': 306, '1': 72.8333, '2': 327.1, '3': 148.6, '4': 319.5, '5': 173},
    {override: true},
  )
  const testObj3 = sheet.object(
    'path2',
    {'0': 310, '1': 203.5, '2': 106.5, '3': 357, '4': 119, '5': 404.5},
    {override: true},
  )
  const testObj4 = sheet.object(
    'path3',
    {'0': 131.5, '1': 452, '2': 348.057, '3': 425.067, '4': 326.5, '5': 393},
    {override: true},
  )
  const testObj5 = sheet.object(
    'path4',
    {'0': 166.5, '1': 155, '2': 493.333, '3': 451.667, '4': 549.5, '5': 461.5},
    {override: true},
  )

  const [c1, setC1] = useState(testObj2.value)
  const [c2, setC2] = useState(testObj3.value)
  const [c3, setC3] = useState(testObj4.value)
  const [c4, setC4] = useState(testObj5.value)

  const toS = (obj: {[key: number]: number}) =>
    'C' +
    Object.entries(obj)
      .map(([key, value]) => value)
      .join(' ')
  const all = () => toS(c1) + toS(c2) + toS(c3) + toS(c4)

  useEffect(() => {
    testObj2.onValuesChange((o) => {
      setC1(o)
    })
    testObj3.onValuesChange((o) => {
      setC2(o)
    })
    testObj4.onValuesChange((o) => {
      setC3(o)
    })
    testObj5.onValuesChange((o) => {
      setC4(o)
    })
    return testObj.onValuesChange(({t}) => {
      const totalLength = pathRef.current?.getTotalLength()
      const point = pathRef.current?.getPointAtLength(t * totalLength)
      if (point && state.cx !== point.x && state.cy !== point.y) {
        setState({cx: point.x, cy: point.y})
      }
    })
  })

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: 0,
        bottom: '0',
        background: '#333',
      }}
    >
      {/* <button
        style={{
          top: '16px',
          left: '60px',
          position: 'absolute',
          padding: '.25rem .5rem',
        }}
        onClick={() => {
          setBoxes((boxes) => [...boxes, String(++lastBoxId)])
        }}
      >
        Add
      </button> */}
      {boxes.map((id) => (
        <Box
          key={'box' + id}
          id={`Box / ${id}`}
          sheet={sheet}
          selection={selection ?? []}
        />
      ))}
      <svg
        width="300"
        height="610"
        viewBox="-100 0 687 610"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M293.5 23L547.678 463.25H39.3215L293.5 23Z" fill="white" />
        <ellipse cx="547.5" cy="461" rx="23.5" ry="23" fill="#1813FF" />
        <ellipse cx="38.5" cy="461" rx="23.5" ry="23" fill="#49DC31" />
        <path
          d={`M293 23${all()}`}
          stroke="url(#paint0_radial_1_13)"
          strokeWidth="10"
          style={{mixBlendMode: 'multiply'}}
          ref={pathRef}
        />
        <path
          d={`M293 23${all()}`}
          stroke="url(#paint1_radial_1_13)"
          strokeWidth="10"
          style={{mixBlendMode: 'multiply'}}
        />
        <path
          d={`M293 23${all()}`}
          stroke="url(#paint2_radial_1_13)"
          strokeWidth="10"
          style={{mixBlendMode: 'multiply'}}
        />
        <ellipse cx="293.5" cy="23" rx="23.5" ry="23" fill="#FF3434" />
        <circle cx={state.cx} cy={state.cy} r="14" fill="white" />
        <circle
          cx={state.cx}
          cy={state.cy}
          r="9.53191"
          fill="url(#paint1_radial_1_13)"
        />
        <circle
          cx={state.cx}
          cy={state.cy}
          r="9.53191"
          fill="url(#paint2_radial_1_13)"
        />
        <circle
          cx={state.cx}
          cy={state.cy}
          r="9.53191"
          fill="url(#paint0_radial_1_13)"
        />

        <defs>
          <filter
            id="filter0_d_1_13"
            x="275"
            y="9"
            width="36"
            height="36"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_1_13"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_1_13"
              result="shape"
            />
          </filter>
          <radialGradient
            id="paint0_radial_1_13"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(290.5 24) rotate(90) scale(438 553.142)"
          >
            <stop stopColor="#FF3434" />
            <stop offset="0.255208" stopColor="#FF3434" />
            <stop offset="1" stopColor="#FF3434" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id="paint1_radial_1_13"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(550 462) rotate(-146.058) scale(442.378 323.408)"
          >
            <stop stopColor="#1813FF" />
            <stop offset="1" stopColor="#1813FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id="paint2_radial_1_13"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(45.0003 462) rotate(-29.5794) scale(429.472 289.205)"
          >
            <stop stopColor="#49DC31" />
            <stop offset="1" stopColor="#49DC31" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

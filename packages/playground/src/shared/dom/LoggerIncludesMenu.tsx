import type {
  IBox,
  IDerivation,
  Ticker} from '@theatre/dataverse';
import {
  isDerivation,
  prism,
  val,
} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import {usePrism, useVal} from '@theatre/react'
import {TheatreLoggerLevel} from '@theatre/shared/logger'
import type {
  ITheatreLogIncludes,
  ITheatreLogSource,
} from '@theatre/shared/_logger/_archive.cldev/logger.cldev'

import React, {useContext} from 'react'
import styled from './styled'

export function LoggerIncludesMenu({state}: {state: LoggerIncludeState}) {
  return (
    <context.Provider value={state}>
      <LoggerMenuUI />
    </context.Provider>
  )
}

const context = React.createContext<LoggerIncludeState>(null!)
const useMenuState = () => useContext(context)
export type LoggerIncludeState = ReturnType<typeof createLoggerIncludeState>

const LoggerMenuUIContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
`

const LoggerMenuUI = React.memo(() => {
  return (
    <>
      <LoggerMenuUIContainer
        style={{
          position: 'fixed',
          top: 20,
          right: 200,
          width: 300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuSearchInput />
        <MenuSearchResults />
      </LoggerMenuUIContainer>
    </>
  )
})

const Hmm = styled.div``

function styledRx() {}

const SearchInput = styled.input``

const MenuSearchInput = React.memo(() => {
  const menu = useMenuState()
  // const val = useVal(menu.search.searchValue$.derivation)
  return (
    <>
      <label htmlFor="logger-menu-ui">Search</label>
      <menu.search.searchValue$.react
        render={(value) => (
          <SearchInput
            type="text"
            id="logger-menu-ui"
            value={value}
            onChange={(event) =>
              menu.search.setSearchValue(event.currentTarget.value)
            }
          />
        )}
      />
    </>
  )
})
const MenuSearchInputBkup = React.memo(() => {
  const menu = useMenuState()
  const val = useVal(menu.search.searchValue$.derivation)
  return (
    <>
      <label htmlFor="logger-menu-ui">Search</label>
      <input
        type="text"
        id="logger-menu-ui"
        value={val}
        onChange={(event) =>
          menu.search.setSearchValue(event.currentTarget.value)
        }
      />
    </>
  )
})

const MenuSearchResults = React.memo(() => {
  const menu = useMenuState()
  const searchUpperCaseElt = deriveReact(
    menu.search.searchValue$.map((str) => str.toUpperCase()),
    (value) => <h1>{value}</h1>,
  )

  return (
    <>
      {searchUpperCaseElt}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {deriveReact(deriveObjD({shownKeys: menu.shownKeysD}), ({shownKeys}) =>
          shownKeys.map((source) => (
            <MenuItem
              config={source.config}
              label={source.label}
              key={source.label}
            />
          )),
        )}
      </div>
      <button onClick={() => menu.save()}>Save</button>
    </>
  )
})

class Behavior<T> {
  public readonly derivation: IDerivation<T>
  constructor(inner: IDerivation<T> | IBox<T>) {
    this.derivation = isDerivation(inner) ? inner : inner.derivation
  }
  react(props: {render(value: T): JSX.Element}): JSX.Element {
    return DeriveElement({der: this.derivation, render: props.render})
  }
}

class BehaviorSubject<T> extends Behavior<T> {
  public readonly box: IBox<T>
  set(value: T) {
    this.box.set(value)
  }
  get() {
    return this.box.get()
  }
  constructor(initial: T) {
    const box = new Box(initial)
    super(box.derivation)
    this.box = box
  }
}

type CombineLatestOf<T extends Record<string, IDerivation<any>>> = IDerivation<
  {
    [P in keyof T]: T[P] extends IDerivation<infer R> ? R : never
  }
>

function deriveObjD<T extends Record<string, IDerivation<any>>>(
  obj: T,
): CombineLatestOf<T> {
  const value = prism(() =>
    objMap(obj, ([_key, derivation]) => val(derivation)),
  )

  return value as CombineLatestOf<T>
}

function deriveReact<T>(
  der: IDerivation<T>,
  render: (value: T) => React.ReactChild | JSX.Element | JSX.Element[],
) {
  return <DeriveElement der={der} render={render} />
}
function DeriveElement<T>(props: {
  der: IDerivation<T>
  render: (value: T) => React.ReactChild | JSX.Element | JSX.Element[]
}) {
  const value = usePrism(() => val(props.der), [props.der])
  return <>{props.render(value)}</>
}

const MenuItem = (props: {label: string; config: IncludesConfigBox}) => {
  const tileProps = {
    currentValueD: props.config.derivation.map(({min} = {}) => min),
    setValue(min: TheatreLoggerLevel | undefined) {
      props.config.set({...props.config.get(), min})
    },
  }

  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      R
      <LogLevelTile color="gray" value={undefined} {...tileProps} />
      <LogLevelTile
        color="orangered"
        value={TheatreLoggerLevel.ERROR}
        {...tileProps}
      />
      <LogLevelTile
        color="orange"
        value={TheatreLoggerLevel.WARN}
        {...tileProps}
      />
      <LogLevelTile
        color="lawngreen"
        value={TheatreLoggerLevel.DEBUG}
        {...tileProps}
      />
      <LogLevelTile
        color="dodgerblue"
        value={TheatreLoggerLevel.TRACE}
        {...tileProps}
      />{' '}
      <b>{props.label}</b>
    </div>
  )
}

const LogLevelTile = (props: {
  color: string
  currentValueD: IDerivation<TheatreLoggerLevel | undefined>
  value: TheatreLoggerLevel | undefined
  setValue: (value: TheatreLoggerLevel | undefined) => void
}) => {
  // const element = usePrism(() => {
  //   const currentValue = val(props.currentValueD)

  //   const isSelected =
  //     currentValue === props.value ||
  //     (currentValue != null &&
  //       props.value != null &&
  //       currentValue <= props.value)
  //   return <span>T{innerTile(isSelected)}</span>
  // }, [props.color, props.value, props.setValue])

  // console.error("here")

  return (
    <span>
      T
      {deriveReact(
        // how do I get distinct values?
        props.currentValueD.map(
          (currentValue) =>
            currentValue === props.value ||
            (currentValue != null &&
              props.value != null &&
              currentValue <= props.value),
        ),
        innerTile,
      )}
    </span>
  )

  function innerTile(isSelected: boolean) {
    return (
      <div
        style={{
          width: '1em',
          height: '1em',
          background: isSelected ? props.color : 'transparent',
          borderStyle: 'solid',
          borderColor: props.color,
          borderWidth: 2,
          opacity: isSelected ? 1 : 0.6,
          cursor: 'pointer',
        }}
        title={
          props.value != null ? TheatreLoggerLevel[props.value] : 'Default'
        }
        onClick={() => props.setValue(props.value)}
      />
    )
  }
}

export type LoggerIncludePersistedState = {
  input: string
  sources: [string, ITheatreLogIncludes][]
}

type IncludesConfigBox = Box<ITheatreLogIncludes | undefined>
export function createLoggerIncludeState(
  ticker: Ticker,
  initialState: LoggerIncludePersistedState = {input: '', sources: []},
) {
  const stateB = new BehaviorSubject(initialState)

  const inputValue = new BehaviorSubject(initialState.input)

  inputValue.derivation.changes(ticker).tap((value) => {
    console.log('update state', {value})
    stateB.set({...stateB.get(), input: value})
  })

  const allKeysB = new Box([] as [string, IncludesConfigBox][])

  const configuredNames = new IncludesMapEmitter<
    ITheatreLogSource,
    IncludesConfigBox
  >(
    initialState.sources.map(([key, value]) => [
      key,
      new Box<ITheatreLogIncludes | undefined>(value),
    ]),
    (source) => {
      const len = source.names.length
      return len > 1
        ? `${source.names[len - 1].name}/${source.names[len - 2].name}`
        : source.names[len - 1]?.name ?? '<Unnamed>'
    },
    () => new Box<ITheatreLogIncludes | undefined>(undefined),
    (updatedKeys) => {
      allKeysB.set([...updatedKeys])
    },
  )

  return {
    search: {
      searchValue$: inputValue,
      setSearchValue(value: string) {
        inputValue.set(value)
      },
    },
    shownKeysD: allKeysB.derivation.map((keys) =>
      keys.map(([key, config]) => ({
        label: key,
        config,
      })),
    ),
    save() {
      const value = allKeysB.get()
      stateB.set({
        ...stateB.get(),
        sources: value.flatMap(([key, value]) => {
          const val = value.get()
          return val ? [[key, val]] : []
        }),
      })
    },
    stateD: stateB.derivation,
    includeFn(source: ITheatreLogSource): ITheatreLogIncludes {
      const box = configuredNames.getOrSetDefault(source)
      return box.get() ?? {}
    },
  }
}

class IncludesMapEmitter<K, V> {
  private inner: Map<string, V>
  constructor(
    initialValues: [string, V][],
    private keyHasher: (key: K) => string,
    private defaultValue: (key: K | string) => V,
    private onUpdate: (allKeys: IterableIterator<[string, V]>) => void,
  ) {
    this.inner = new Map<string, V>(initialValues)
  }
  getOrSetDefault(key: K | string): V {
    const keyStr = typeof key === 'string' ? key : this.keyHasher(key)
    let existing = this.inner.get(keyStr)
    if (!existing) {
      existing = this.defaultValue(key)
      this.inner.set(keyStr, existing)
      this.onUpdate(this.inner.entries())
    }
    return existing
  }
}

function objMap<T, U>(
  template: T,
  eachEntry: <P extends keyof T>(entry: [name: P, value: T[P]]) => U,
): {[P in keyof T]: U} {
  // @ts-ignore
  return Object.fromEntries(
    Object.entries(template).map((entry) => {
      // @ts-ignore
      return [entry[0], eachEntry(entry)]
    }),
  )
}

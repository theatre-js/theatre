import type {IDerivation, Ticker} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import type {
  ITheatreLogIncludes,
  ITheatreLogSource,
} from '@theatre/shared/logger'
import {TheatreLoggerLevel} from '@theatre/shared/logger'

import React, {useContext} from 'react'
import {reactD, childD} from './derive-utils'
import styleD from './_styleD'

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

const LoggerMenuUIContainer = styleD.div`
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

const SearchInput = styleD.input``
const SearchLabel = styleD.label``

const MenuSearchInput = React.memo(() => {
  const menuSearch = useMenuState().search

  return (
    <>
      <SearchLabel htmlFor="logger-menu-ui">Search</SearchLabel>
      <SearchInput
        type="text"
        id="logger-menu-ui"
        value={menuSearch.searchValueD}
        onChange={(event) =>
          menuSearch.setSearchValue(event.currentTarget.value)
        }
      />
    </>
  )
})

const MenuSearchResults = React.memo(() => {
  const menu = useMenuState()
  const searchUpperCaseD = menu.search.searchValueD.map((str) =>
    str.toUpperCase(),
  )

  return (
    <>
      <h1>{childD(menu.search.searchValueD)}</h1>
      {childD(searchUpperCaseD)}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {reactD(menu.shownKeysD, (shownKeys) =>
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

const LogLevelTileInnerTile = styleD.div<{color: string}>`
  width: 1em;
  height: 1em;
  borderStyle: 'solid';
  borderColor: ${(props) => props.color};
  borderWidth: 2px;
  cursor: pointer;
`

let _i = 0
const uniq = (name: string) => {
  let last: string = name
  return {
    last(iam: string) {
      return last + ` (${iam})`
    },
    gen: (iam: string) => {
      last = (++_i).toString(16).replace(/^(.*)(.)$/, `${name} $2$1`)
      return last + ` (${iam})`
    },
  }
}

const LogLevelTile = (props: {
  color: string
  currentValueD: IDerivation<TheatreLoggerLevel | undefined>
  value: TheatreLoggerLevel | undefined
  setValue: (value: TheatreLoggerLevel | undefined) => void
}) => {
  let hmm = uniq(`LogLevelTile "${props.color}"`)
  return (
    <span>
      T
      <LogLevelTileInnerTile
        color={props.color}
        style={props.currentValueD
          .map((currentValue) => {
            console.log(hmm.gen('map 1 currentValueD'), currentValue)
            return (
              currentValue === props.value ||
              (currentValue != null &&
                props.value != null &&
                currentValue <= props.value)
            )
          })
          .distinct()
          // inline distinct?
          .map((isSelected) => {
            console.log(hmm.last('map 2 isSelected'), isSelected)
            return {
              opacity: isSelected ? 1 : 0.6,
              background: isSelected ? props.color : 'transparent',
            }
          })}
        title={
          props.value != null ? TheatreLoggerLevel[props.value] : 'Default'
        }
        onClick={() => props.setValue(props.value)}
      />
    </span>
  )
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
  const stateB = new Box(initialState)
  const inputValue = new Box(initialState.input)

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
      searchValueD: inputValue.derivation,
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

export function objMap<T, U>(
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

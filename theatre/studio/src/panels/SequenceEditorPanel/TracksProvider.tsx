import type {Dispatch, SetStateAction} from 'react'
import React, {createContext, useState, useContext} from 'react'

const Context = createContext<{
  trackToHighlight?: string
  setTrackToHighlight: Dispatch<SetStateAction<string | undefined>>
}>({
  trackToHighlight: '',
  setTrackToHighlight: () => {},
})

const TracksProvider: React.FC = ({children}) => {
  const [trackToHighlight, setTrackToHighlight] = useState<string>()

  return (
    <Context.Provider value={{trackToHighlight, setTrackToHighlight}}>
      {children}
    </Context.Provider>
  )
}

export const useTracksProvider = () => useContext(Context)

export default TracksProvider

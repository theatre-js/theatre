import type {Dispatch, SetStateAction} from 'react'
import React, {createContext, useState, useContext} from 'react'

const Context = createContext<{
  trackToHighlightId?: string
  setTrackToHighlightId: Dispatch<SetStateAction<string | undefined>>
}>({
  trackToHighlightId: '',
  setTrackToHighlightId: () => {},
})

const TracksProvider: React.FC = ({children}) => {
  const [trackToHighlightId, setTrackToHighlightId] = useState<string>()

  return (
    <Context.Provider value={{trackToHighlightId, setTrackToHighlightId}}>
      {children}
    </Context.Provider>
  )
}

export const useTracksProvider = () => useContext(Context)

export default TracksProvider

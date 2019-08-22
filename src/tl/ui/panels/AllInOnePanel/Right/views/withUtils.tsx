import React from 'react'
import {
  IPropGetter,
  ItemPropGetterContext,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import {OverlaysAPIContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/OverlaysProvider'
import {IOverlaysAPI} from '$tl/ui/panels/AllInOnePanel/Right/timeline/overlays/types'
import {SelectionAPIContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import {ISelectionAPI} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {
  ExtremumsAPIContext,
  IExtremumsAPI,
} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPointsNormalizer'

export interface IWithUtilsProps {
  propGetter: IPropGetter
  overlaysAPI: IOverlaysAPI
  selectionAPI: ISelectionAPI
  extremumsAPI: IExtremumsAPI
}

export default <P extends {}>(
  Component: React.ComponentType<P & IWithUtilsProps>,
) => (props: P) => (
  <ItemPropGetterContext.Consumer>
    {propGetter => (
      <SelectionAPIContext.Consumer>
        {selectionAPI => (
          <OverlaysAPIContext.Consumer>
            {overlaysAPI => (
              <ExtremumsAPIContext.Consumer>
                {extremumsAPI => (
                  <Component
                    {...props}
                    propGetter={propGetter}
                    overlaysAPI={overlaysAPI}
                    selectionAPI={selectionAPI}
                    extremumsAPI={extremumsAPI}
                  />
                )}
              </ExtremumsAPIContext.Consumer>
            )}
          </OverlaysAPIContext.Consumer>
        )}
      </SelectionAPIContext.Consumer>
    )}
  </ItemPropGetterContext.Consumer>
)

import React from 'react'
import Item from '$tl/ui/panels/AllInOnePanel/Bottom/Item'
import MdSettings from 'react-icons/lib/md/settings'
import css from './Settings.css'
import resolveCss from '$shared/utils/resolveCss'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList/FlyoutSearchableList'
import ExportModal from '$tl/ui/panels/AllInOnePanel/Bottom/Settings/ExportModal'
import UIComponent from '$tl/ui/handy/UIComponent'

const classes = resolveCss(css)

interface IProps {}

interface IState {
  menuOpen: boolean
  exportOpen: boolean
  exportString: string
}

class Settings extends UIComponent<IProps, IState> {
  iconContainerRef: React.RefObject<HTMLDivElement> = React.createRef()

  state = {
    menuOpen: false,
    exportOpen: false,
    exportString: '',
  }

  render() {
    return (
      <>
        {this.state.menuOpen && (
          <FlyoutSearchableList
            options={['Export']}
            onSelect={this.onSelect}
            close={this.closeMenu}
            listStyle={{
              right: -this.iconContainerRef.current!.parentElement!.getBoundingClientRect()
                .width,
            }}
          />
        )}
        {this.state.exportOpen && (
          <ExportModal
            onClose={this.closeExportModal}
            exportString={this.state.exportString}
            internalProject={this.internalProject}
          />
        )}
        <Item onClick={this.onClick}>
          <div ref={this.iconContainerRef} {...classes('container')}>
            <MdSettings />
          </div>
        </Item>
      </>
    )
  }

  onSelect = (selectedOption: string) => {
    if (selectedOption === 'Export') {
      const historicState = this.internalProject.reduxStore.getState().historic[
        '@@history'
      ].innerState

      this.internalProject._dispatch(
        this.internalProject._actions.ephemeral.prepareExportJson({
          historicState,
        }),
      )

      const exportString = JSON.stringify(
        this.internalProject.reduxStore.getState().ephemeral.lastExportedObject,
        null,
        2,
      )

      this.setState(() => ({
        menuOpen: false,
        exportOpen: true,
        exportString,
      }))
    }
  }

  closeExportModal = () => {
    this.setState(() => ({exportOpen: false}))
  }

  onClick = () => {
    this.setState({menuOpen: !this.state.menuOpen})
  }

  closeMenu = () => {
    this.setState({menuOpen: false})
  }
}

export default Settings

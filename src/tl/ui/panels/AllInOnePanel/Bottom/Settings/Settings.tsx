import React from 'react'
import Item from '$tl/ui/panels/AllInOnePanel/Bottom/Item'
import MdSettings from 'react-icons/lib/md/settings'
import css from './Settings.css'
import resolveCss from '$shared/utils/resolveCss'
import FlyoutSearchableList from '$shared/components/FlyoutSearchableList/FlyoutSearchableList'
import ExportModal from '$tl/ui/panels/AllInOnePanel/Bottom/Settings/ExportModal'

const classes = resolveCss(css)

interface IProps {}

interface IState {
  menuOpen: boolean
  exportOpen: boolean
}

class Settings extends React.PureComponent<IProps, IState> {
  iconContainerRef: React.RefObject<HTMLDivElement> = React.createRef()

  state = {
    menuOpen: false,
    exportOpen: false,
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
        {this.state.exportOpen && <ExportModal onClose={this.closeExport} />}
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
      this.setState(() => ({
        menuOpen: false,
        exportOpen: true,
      }))
    }
  }

  closeExport = () => {
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

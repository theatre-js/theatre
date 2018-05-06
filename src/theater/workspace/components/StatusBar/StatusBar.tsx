import * as css from './StatusBar.css'
import React from 'react'
import cx from 'classnames'
import GoRepoForked from 'react-icons/lib/go/repo-forked'
import MdApps from 'react-icons/lib/md/apps'
import MdLiveHelp from 'react-icons/lib/md/live-help'
import MdTouchApp from 'react-icons/lib/md/touch-app'
import MdImportExport from 'react-icons/lib/md/import-export'
import {MODE_OPTION} from '$src/studio/common/components/ActiveModeDetector/ActiveModeDetector'

class StatusBar extends React.PureComponent<any, any> {
  render() {
    return (
      <div
        className={cx(css.container, {
          [css.onTop]: this.props.activeMode === MODE_OPTION,
        })}
      >
        <div className={css.leftContainer}>
          <div className={css.item}>
            <MdApps className={css.icon} />
            <span className={css.text}>Artboards</span>
          </div>
          <div className={css.item}>
            <MdTouchApp className={css.dexterIcon} />
            <span className={css.text}>Dexter Mode</span>
          </div>
        </div>
        <div className={css.rightContainer}>
          <div className={css.item}>
            <GoRepoForked className={css.syncedIcon} />
            <span className={css.text}>Synced</span>
          </div>
          <div className={css.item}>
            <MdImportExport className={css.syncedIcon} />
            <span className={css.text}>Import/Export</span>
          </div>
          <div className={css.item}>
            <MdLiveHelp className={css.icon} />
            <span className={css.text}>Help</span>
          </div>
        </div>
      </div>
    )
  }
}

export default StatusBar

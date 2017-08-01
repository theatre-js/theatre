// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import css from './index.css'
import FolderDropzone from './FolderDropzone'

type Props = {}

const ProjectsPage = (props: Props) => {
  return (
    <FolderDropzone css={css.dropzone} activeCss={css.activeDropzone}>
      FolderDropzone here!
    </FolderDropzone>
  )
}

export default compose(
  (a) => a
)(ProjectsPage)
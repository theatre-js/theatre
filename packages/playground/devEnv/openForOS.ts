import {spawn} from 'child_process'

export function openForOS(hostedAt: string) {
  const open = {
    darwin: ['open'],
    linux: ['xdg-open'],
    win32: ['cmd', '/c', 'start'],
  }
  const platform = process.platform as keyof typeof open
  if (open[platform]) {
    spawn(open[platform][0], [...open[platform].slice(1), hostedAt])
  } else {
    console.error(
      `Failed to open (${hostedAt}) for unconfigured platform (${platform})`,
    )
  }
}

import {cn} from '~/ui/lib/utils'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/ui/components/ui/context-menu'

interface WorkspaceThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description: string
  thumbnail: string
  onDelete?: () => void
  onDuplicate?: () => void
  onInvite?: () => void
  onEdit?: () => void
  allowEdit?: boolean
}

export default function WorkspaceThumb({
  name,
  description,
  thumbnail,
  onDelete,
  onDuplicate,
  onInvite,
  onEdit,
  allowEdit,
  className,
  ...props
}: WorkspaceThumbProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger disabled={!allowEdit}>
          <div className="overflow-hidden rounded-md w-full h-[200px]">
            <div
              className={'transition-all hover:scale-105 w-full h-full'}
              style={{
                backgroundImage: `url(${thumbnail})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem onSelect={onInvite}>
            Invite collaborators
          </ContextMenuItem>
          <ContextMenuItem onSelect={onEdit}>Edit</ContextMenuItem>
          <ContextMenuItem onSelect={onDuplicate}>Duplicate</ContextMenuItem>
          <ContextMenuItem
            onSelect={onDelete}
            className="data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{name}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

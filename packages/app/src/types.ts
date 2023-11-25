import {z} from 'zod'

export namespace studioAccessScopes {
  export const listWorkspaces = z
    .literal(`workspaces-list`)
    .describe(
      `This scope allows the client (studio) to get the list of workspaces the user has access to, including their ids, names, thumbnails, and last edit time`,
    )

  export type ListWorkspaces = z.infer<typeof listWorkspaces>
  export const editWorkspace = z
    .custom<`edit-workspace:${string}`>((v) =>
      typeof v === 'string' && /^edit-workspace\:([a-zA-Z0-9\n\-]+)$/.test(v)
        ? true
        : false,
    )
    .describe(
      `This scope allows the client (studio) to edit a specific workspace (assuming the user has access to it).`,
    )
  export type EditWorkspace = z.infer<typeof editWorkspace>

  export const scope = z.union([listWorkspaces, editWorkspace])
  export type Scope = z.infer<typeof scope>

  export const scopes = z.array(scope)
  export type Scopes = z.infer<typeof scopes>
}

export namespace studioAuthTokens {
  export const accessTokenPayload = z.object({
    userId: z.string(),
    email: z.string(),
    scopes: studioAccessScopes.scopes,
  })
  export type AccessTokenPayload = z.infer<typeof accessTokenPayload>

  export const idTokenPayload = accessTokenPayload.extend({nounce: z.string()})
  export type IdTokenPayload = z.infer<typeof idTokenPayload>
}

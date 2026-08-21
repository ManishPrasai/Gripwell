/**
 * Client-side fetch helpers for the admin console.
 *
 * `adminFetch` is the single entry point for every write action. It posts JSON,
 * throws a typed error on failure (so pages can toast the real message), and
 * returns the `data` payload the mutation contract sends back.
 *
 * Pair every successful write with `ctx.refetch()` (SWR revalidation) so the UI
 * reflects server truth and survives a refresh — no more local-state-only edits.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: string[]) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function adminFetch<T = unknown>(
  url: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  let json: any = null
  try { json = await res.json() } catch { /* empty body */ }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.error || `Request failed (${res.status})`,
      json?.details,
    )
  }
  return (json?.data ?? json) as T
}

/** SWR fetcher for GET endpoints. */
export const swrFetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new ApiError(res.status, 'Failed to load')
  return res.json()
}

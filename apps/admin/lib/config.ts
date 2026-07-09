/**
 * Admin console feature flags.
 *
 * IDLE_LOGOUT_ENABLED — the 30-minute inactivity auto-logout. Temporarily
 * disabled. Flip this to `true` to re-enable it everywhere at once: the client
 * idle timer (App.tsx) and the server-side inactivity checks in the
 * /api/auth/refresh and /api/auth/refresh-redirect routes all read this flag.
 * The full implementation is kept intact — only the enforcement is gated.
 */
export const IDLE_LOGOUT_ENABLED = false

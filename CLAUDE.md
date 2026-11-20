# Nova Tyres — project instructions

## Cross-session handoff (IMPORTANT)
This project is worked on from **two Claude Code instances**: the VS Code extension and the terminal CLI. To keep them in sync:

1. **At the start of every session**, read `.claude/HANDOFF.md` to learn what the last session did and where it left off. (It is also auto-injected via a SessionStart hook, but read it directly if you don't see it.)
2. **Before you finish**, UPDATE `.claude/HANDOFF.md`: current focus, what you did, next steps, and any gotchas. Keep it short, current, and accurate. Update the "Last updated" line.
3. Prefer committing meaningful progress (or at least noting uncommitted state in the handoff) so the other instance has a trail.

## Project shape
- Turborepo monorepo: `apps/` (incl. `customer`, `admin`) + `packages/`
- Next.js customer app in `apps/customer`; Prisma; Stripe; Resend email; deployed on Vercel
- A knowledge graph exists in `graphify-out/` — usable via the `graphify` skill for architecture questions

## Knowledge graph (graphify)
- Before changes that touch several files (shared libs like `lib/fitting.ts`, `STORES`, cart, checkout), run `graphify query "..."` to find callers and dependents, then confirm in the actual files. The graph can be stale; the files are the truth.
- Skip it for small, targeted fixes where the file is already known.
- After a big change lands (e.g. a redesign stage), refresh with `/graphify . --update` (only changed files are reprocessed) and note it in the handoff.

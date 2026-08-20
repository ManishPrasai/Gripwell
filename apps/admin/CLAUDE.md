@AGENTS.md

## Session Context & Handoff Policy

- Always read `.claude/HANDOFF.md` at session start.
- **Auto-Update Trigger:** After completing any major milestone, file refactor, or right before ending a major response, update `.claude/HANDOFF.md` with:
  1. **Current Status**: What was completed in this turn.
  2. **In Progress**: Active bugs or incomplete files.
  3. **Next Steps**: Exact prompt/task for the next session to pick up.

## Pre-Compaction Rule

If you notice the conversation history is growing large or if you run `/compact`, update `.claude/HANDOFF.md` immediately BEFORE compacting so no nuance is lost during compression.

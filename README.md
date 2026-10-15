# LIV DOT — Host Event Dashboard

A host-facing dashboard for taking a single live-ticketed event through its lifecycle — draft, scheduling, readiness checks, going live, and wrapping up. Built against a take-home brief focused on UI state modeling, not visual design; the backend is fully mocked.

## Setup

```
npm install
npm run dev
```

Opens on `http://localhost:5173` (or the next free port Vite picks).

No environment variables, no real backend — everything runs against an in-memory mock API that resets on page reload.

## State Modeling

### How the UI state is structured

- **`src/domain`** — the actual rules, with zero React in it. `event.ts` defines the `EventState` union (`draft → scheduled → ready → live → completed → replay`) and the `Event` shape. `readiness.ts` defines what a requirement is and what counts as "satisfied." `schedule.ts` defines what counts as a valid schedule date. `transitions.ts` defines which states can move to which, and what blocks each move. This layer is pure and testable in isolation — nothing here imports React.
- **`src/api`** — a mock backend. Seed data plus async functions with artificial latency, each one re-running the same domain checks server-side that the UI already ran client-side.
- **`src/hooks/useEvent.ts`** — the only bridge between domain/api and components. It owns the fetched event, a pending flag *per action* (not one global spinner), and `advanceCheck`, which is recomputed from the domain layer on every render — so knowing *why* an action is blocked never requires a network round trip.
- **Components** are presentational. They render props and call callbacks; none of them contain business rules.

### How transitions are handled

There's one generic action, `advance()`, rather than a separate function per state. Its button label and target state come from `nextState(event.state)`, a lookup table in `transitions.ts` — not from per-state branching in a component.

`checkTransition(event, target)` returns `{ allowed, blockers[] }` instead of a boolean. Every blocker carries a machine-readable reason (`missing-schedule`, `missing-requirement`, `invalid-transition`) plus whatever data the UI needs to describe it in plain language. The same function is called from two places: the mock API (authoritative — rejects an illegal transition outright) and the hook (instant, local, purely for rendering). This means the UI's "why is this blocked" messaging can never drift out of sync with what the backend would actually allow.

### How blocked and incomplete states are shown

- The advance button is disabled and lists every current blocker as plain text, not just "blocked."
- Scheduling a past date is rejected client-side before any request fires (`checkSchedule`), and re-validated in the mock API as a second line of defense — the first version of this didn't check this case at all, and letting a past-dated event look "scheduled" was a real bug, not just a missing nicety.
- The readiness checklist locks once an event reaches `ready` or later. There's no "demote" transition in the model, so leaving the checklist editable at that point let a host uncheck a requirement on a *live* event without anything happening — the badge would say "Live" while the checklist looked unsatisfied. Locking it once it's done its job keeps the UI honest.
- Every async action — advancing, scheduling, toggling a requirement — has its own pending state, so ticking one checkbox doesn't disable the other two or the advance button while it's in flight.

## Implementation Notes

### Component structure

```
src/domain      pure business rules — event lifecycle, readiness, scheduling validation
src/api         mock backend — seed data, async functions, artificial latency, server-side validation
src/hooks       useEvent — the only thing that talks to src/api
src/components  EventDashboard, EventStateBadge, ReadinessChecklist, TransitionControls
```

`EventDashboard` is the shell — it owns loading/error states and composes the rest. `ReadinessChecklist` and `TransitionControls` are pure props-in/callbacks-out components with no knowledge of each other.

### State management approach

Plain React (`useState` / `useCallback`) inside one hook — no external state library. The dataset is small (one event, three requirements, six states) and nothing here needs cross-component subscriptions beyond what one hook and a few levels of prop drilling already handle cleanly. Reaching for Redux/Zustand would be solving a problem this app doesn't have.

### Assumptions and tradeoffs

- **Single-event dashboard.** The brief describes "a host managing an event," singular. `src/api` returns arrays and could back a list view later, but nothing asked for one, so I didn't build it.
- **Only `scheduled → ready` is gated by readiness requirements.** The brief's own wording — "Scheduled - event scheduled but not ready" — implies an event can be scheduled before requirements are satisfied. That's the intended path, not a gap.
- **Styling is intentionally minimal.** The brief states visual polish isn't the focus; structure and state handling were prioritized over design.
- **No simulated random network failures.** The mock API only rejects requests that violate an actual domain rule (bad date, illegal transition, locked requirement) — never randomly. Retry/timeout handling felt out of scope for what this exercise evaluates.
- **`actionError` is a single shared string** across all actions in the hook, not scoped per-action. Fine for one host clicking one thing at a time; would need splitting if multiple actions could realistically race.

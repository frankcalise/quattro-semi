# Quattro Semi Epics

This breakdown turns the vision into staged delivery work for the first Expo CNG repository milestone and the playable graybox that follows it.

## Epic 0: Expo CNG Foundation

Goal: make the repository buildable as a custom-dev-client Expo app with the intended native stack.

- Expo Router under `src/app`
- New Architecture enabled through CNG config
- Bun scripts for start, native runs, typecheck, tests, doctor, and Maestro
- TypeScript strict mode and `@/*` path aliases
- Dev-build posture documented; Expo Go is not a target
- Secret conventions preserved with `.env.example`

Exit criteria:

- `bun install` completes
- `bun run typecheck` passes
- `bun run test` passes
- iOS and Android prebuilds can be generated without committing native folders

## Epic 1: Deterministic Engine Core

Goal: prove the game rules can run as pure TypeScript and replay from seed plus inputs.

- Seeded RNG and board generation
- 6 x 12 visible board with hidden buffer design noted in types
- Selector movement and legal horizontal swap commands
- Match detection for 3+ suits horizontally and vertically
- Clear, gravity, cascade, chain, and combo resolution
- Rising-row generation and loss-line checks
- Score, timer, level, max chain, max combo, and board hash summaries
- Vitest coverage for rules and replay fixtures

Exit criteria:

- Given a seed and input log, engine output is reproducible
- Core rules are covered by focused unit tests
- Board hashes are stable enough for debug and smoke assertions

## Epic 2: Skia Board Lab

Goal: create the formal debug route that validates rendering, scaling, and input feel.

- `/debug/board-lab` gated from production builds
- Procedural card rendering for Coppe, Bastoni, Spade, and Denari
- Selector rendering and debug overlay
- Swap, clear, fall, and rise animation spikes
- Gesture latency checks with React Native Gesture Handler
- Frame timing or FPS display
- Fixture loading for seeded boards and edge cases

Exit criteria:

- Board scales cleanly across compact and large phones
- Debug summary exposes seed, phase, score, selector, and board hash
- Maestro can smoke-test route visibility and debug state text

## Epic 3: Practice Mode Graybox

Goal: provide a low-pressure route for learning controls and validating rules.

- Practice route and top HUD
- Manual raise control
- Relaxed game-over behavior
- Debug keyboard or scripted controls where useful
- Settings link or in-route toggles for input experiments
- Chain and combo feedback visible enough for testing

Exit criteria:

- A player can move, swap, clear, cascade, and manually raise
- Rule behavior is inspectable through debug summaries
- No automatic pressure is required to keep playing

## Epic 4: Classic Mode Loop

Goal: deliver the first real endless score-attack mode.

- Automatic rising stack
- Manual raise risk/reward
- Level progression and speed increases
- Top loss line and game-over state
- Results screen with score, time survived, max chain, max combo, and level reached
- Local records integration

Exit criteria:

- Classic can be played repeatedly from launch to game over
- Results and local records update deterministically
- Difficulty progression is tunable from mode config

## Epic 5: Game Feel Layer

Goal: add motion, haptics, and sound once the core loop is stable.

- Reanimated as the single animation runtime for gameplay polish
- Low-latency SFX for move, swap, invalid, clear, chain, combo, raise, danger, and game over
- Pulsar haptic patterns with settings toggle
- Pause/resume behavior for app backgrounding
- Audio and haptic settings persisted locally

Exit criteria:

- Feedback is subtle by default and stronger for danger, chains, combos, and game over
- Haptics can be disabled
- Audio does not block or destabilize gameplay

## Epic 6: Agentic Quality Rails

Goal: make the project easy for future agent passes to extend safely.

- Clear module boundaries across game, rendering, input, state, debug, storage, audio, and haptics
- Reproducible fixtures and scripted input logs
- Maestro smoke flows for launch, practice, classic, and board lab
- Validation scripts for typecheck, tests, doctor, and secret leakage
- Architecture notes for engine/rendering contracts

Exit criteria:

- New rule work can be developed in unit tests before UI changes
- Canvas state has observable summaries for automation
- Documentation keeps epics and module contracts current

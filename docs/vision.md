# Quattro Semi Vision

## Working Title

**Quattro Semi** is a portrait-first mobile puzzle game inspired by rising-stack swap-match games and Italian-suited playing cards.

The title means "four suits" and refers to the core tile set:

- Coppe
- Bastoni
- Spade
- Denari

Future special modes may introduce rare tiles such as Lune or Corone, but the four suits remain the game's foundation.

## Product North Star

Quattro Semi should feel like a fast, skillful puzzle game played on a cozy tabletop: warm light, worn cards, quick hands, satisfying card taps, and escalating pressure.

The game is inspired by Italian-suited cards and tabletop play, but it should not lean on heavy cultural theming. UI copy should remain direct, modern, and broadly approachable. The atmosphere should come primarily from cards, table textures, sound, haptics, and motion.

This is a puzzle game, not a casino or gambling product.

Avoid:

- betting language
- casino presentation
- poker-style framing
- chips as currency
- slot-machine effects
- real-money gameplay framing

Prefer:

- score
- chains
- combos
- table
- suits
- practice
- classic play
- mastery

## Initial Game Mode Scope

### Practice Mode

Practice is a low-pressure place to learn the controls and rules.

- 6 x 12 visible board
- hidden rising buffer rows above or below as needed by the engine
- selector-based adjacent swaps
- manual raise available
- automatic rise disabled by default
- game-over behavior can be relaxed or configurable during development
- useful for learning chains and validating debug behavior

### Classic Mode

Classic is the first real playable mode.

- endless score attack
- automatic rising stack
- manual raise for risk/reward
- speed increases through level progression
- game ends when the stack reaches the top loss line
- records score, time survived, max chain, max combo, and level reached

Classic rules should stay deterministic and clean:

- swap horizontally adjacent cards using a two-card selector
- 3 or more matching suits clear horizontally or vertically
- cards above cleared spaces fall
- cascades count as chains
- simultaneous clears count as combos
- new rows enter from the bottom
- the player may manually accelerate the rising board

Suit powers, wildcards, rare cards, power meters, and special tiles are deferred to future modes.

## Future Modes

### Battle Mode

Future battle mode may introduce a computer opponent and later multiplayer concepts.

Potential AI difficulty model:

- Easy: slower reactions, simple clears, limited chain planning
- Medium: competent clears, occasional chains
- Hard: aggressive manual raise, intentional chain construction

Phone layouts should be designed now so future opponent information can fit without redesigning the whole app.

### Special Mode

Future special modes may add rare tiles or rule variants:

- Lune
- Corone
- wildcards
- suit-specific effects
- table variants
- power meters

These should not be part of the first playable graybox.

## Platform Strategy

Primary v1 platforms:

- iOS phone
- Android phone

Secondary targets:

- iPad
- Android tablets
- foldables

Not a v1 commitment:

- web parity
- desktop
- console

Layouts should be driven by available geometry rather than device names. Phone portrait is the primary design target. Tablets and foldables should progressively unlock more spatial layouts, including future side-by-side player/opponent boards when width and posture allow.

## Layout Principles

The primary phone experience is portrait-first and two-handed.

Baseline board:

- 6 columns
- 12 visible rows
- hidden buffer rows for generation and rising behavior

The game should favor fewer, more beautiful cards over a cramped board. Card faces must remain readable on compact phones.

Single-player phone layout should prioritize:

- top HUD for score, level, time, pause, and danger
- large centered board
- integrated selector gestures
- bottom area for secondary controls, settings access, or future mode-specific UI

Future battle phone layout may use a compact opponent summary rather than a full equal-size opponent board.

## Input Model

The primary control model is selector-based adjacent swapping.

- The player controls a two-card horizontal selector.
- Only adjacent horizontal swaps are legal.
- Touch gestures move or trigger the selector.
- Keyboard controls may be supported in debug/development routes for faster testing.

Manual raise should be available in Classic and Practice.

Potential raise input options:

- dedicated raise button
- two-finger hold on the board
- debug keyboard shortcut

The first prototype can support multiple raise inputs while the team evaluates feel.

## Visual Direction

Initial art direction: cozy tabletop, readable cards, warm materials.

Early prototype visual goal:

- procedural Skia-drawn cards
- simple card frame
- simple suit icon
- clear selected, matched, falling, and danger states
- no final art dependency

Later polish may include:

- paper texture
- table surface textures
- illustrated suit marks
- card backs
- subtle print imperfections
- espresso-bar tabletop atmosphere
- cosmetic table/card themes

The first playable milestone should be a playable graybox with enough card identity to preserve the concept, not a polished art vertical slice.

## Audio And Haptics

### Audio

SFX are part of game feel, but audio should come after the core playable loop is in place.

First audio scope:

- selector move
- swap
- invalid action
- match clear
- chain step
- combo
- manual raise
- danger
- game over

Music is deferred until after the core loop feels good.

Audio technical risks:

- low-latency SFX
- Bluetooth headphone behavior
- pause/resume on background
- silent mode and user settings
- separate music and SFX settings later

### Haptics

Use `react-native-pulsar` rather than `expo-haptics`.

Haptics should be:

- enabled by default
- configurable in settings
- subtle during normal play
- richer during danger, chains, combos, and game over

Pulsar requires React Native New Architecture, which aligns with the Expo CNG/dev-build direction.

## Technical Stack

Core stack:

- Expo
- Expo CNG
- Expo Router under `src/app`
- React Native New Architecture
- React Compiler where compatible
- React Native Skia
- Reanimated
- React Native Gesture Handler
- React Native Pulsar
- XState v5
- TypeScript
- Bun
- Vitest
- Maestro

Expo Go compatibility is not a requirement. The project should assume development builds/custom dev clients from the start.

## Rendering And Animation

Use Skia for the active game board.

Do not render the active board as normal React Native view tiles. React should own app structure, menus, settings, and screen composition. The game runtime should own simulation timing and render state.

Use Reanimated as the single animation runtime for gameplay and app polish unless a future spike proves a clear reason to add another animation library.

Animation goals:

- swap motion
- selector motion
- clear flashes
- falling cards
- rising board offset
- danger pulse
- combo/chain feedback
- particles or lightweight effects later

## Engine Architecture

The game engine should be pure TypeScript, deterministic, serializable, and independently testable.

Given:

- initial random seed
- mode config
- timestamped or tick-based input command log

The engine should reproduce:

- tile generation
- selector movement
- swaps
- match detection
- chains
- scoring
- rising behavior
- game-over timing

Use XState for orchestration, not for the frame-by-frame inner simulation.

Good uses for XState:

- boot
- asset loading
- mode setup
- countdown
- playing
- paused
- game over
- results
- settings
- high-level game session transitions

Avoid putting every tile tick, animation frame, or hot-loop state transition into XState.

## Agentic Development And Testing

This project should be built for iterative agentic coding.

Requirements:

- deterministic engine from seed and input log
- small, clear module boundaries
- debug routes from the beginning
- reproducible fixtures
- Vitest coverage for engine rules
- Maestro flows for mobile smoke tests
- stable `testID` values for non-canvas controls
- debug overlays for canvas state
- board hashes or state summaries for assertions
- clear docs and task boundaries for agents

Because Maestro cannot inspect individual Skia-drawn tiles through the native accessibility tree, debug/test affordances should expose observable state.

Examples:

- board hash
- current phase
- score
- level
- selected cell
- visible danger state
- seed
- scripted input controls
- dev-only board fixtures

## Debug Routes

Debug routes are a formal part of the development architecture and should be gated from production builds.

Initial debug route:

- `/debug/board-lab`

Board Lab should prove:

- 6 x 12 board rendering
- procedural card drawing
- selector rendering
- board scaling across phone sizes
- swap animation
- clear animation
- falling animation
- rising offset
- gesture input latency
- debug overlay visibility
- FPS or frame timing display

Possible future debug routes:

- `/debug/skia/card-tile`
- `/debug/skia/swap-animation`
- `/debug/skia/match-clear`
- `/debug/skia/particles`
- `/debug/input-lab`
- `/debug/rise-speed`
- `/debug/seeded-board`

## Persistence

V1 persistence is local-first.

Store locally:

- high score
- best time
- max chain
- max combo
- level reached
- settings
- haptics enabled
- audio enabled
- control preferences

No account system is required for the first repository milestone.

Future optional features:

- leaderboards
- cloud save
- daily challenge
- account/profile

## Monetization Posture

The game should be playable and buildable without ad or purchase services configured.

Preferred future monetization:

- optional cosmetic card backs
- optional table themes
- supporter purchase
- tasteful premium unlocks through RevenueCat

AdMob is optional and experimental later. Avoid ads during active gameplay and avoid monetization that affects competitive fairness.

Do not monetize:

- continues in leaderboard modes
- pay-to-win power-ups
- core game feel

## Open Source And Secrets

The project should be developed openly where possible.

Open:

- source code
- architecture notes
- debug tools
- non-sensitive docs
- early procedural assets

Protected:

- signing credentials
- ad network keys
- RevenueCat keys
- private analytics tokens
- store credentials
- production secrets

Repository requirements:

- `.env.example`
- clear secret-loading conventions
- no committed real secrets
- CI or validation checks for accidental secret leakage
- documented local setup

License posture:

- MIT for code
- separate policy for assets
- original polished assets may use a more restrictive license later

## Analytics And Crash Reporting

First repo milestone:

- no remote analytics by default
- no crash reporting requirement
- local/debug telemetry only where useful

Consumer release planning:

- consider crash reporting
- consider minimal privacy-conscious analytics
- clearly document collection
- avoid invasive tracking
- do not require analytics for core play

## Proposed Repository Structure

```txt
src/app/
  Expo Router routes and route groups

src/components/
  shared React Native UI components

src/game/
  deterministic engine, rules, scoring, RNG, replay

src/rendering/
  Skia board renderer, tile drawing, animation mapping

src/input/
  gestures, selector controls, command mapping

src/state/
  XState machines, app/game orchestration

src/audio/
  SFX playback, audio settings

src/haptics/
  Pulsar patterns and haptic service

src/storage/
  local scores/settings

src/debug/
  debug panels, fixtures, inspectors

assets/
  fonts, images, sounds, static assets

scripts/
  repo automation, validation, fixture tools

.maestro/
  E2E flows

docs/
  vision, architecture, epics, contribution notes
```

## Tooling

Use:

- Bun as package manager and script runner
- Expo recommended ESLint setup
- Prettier
- TypeScript strict mode
- Vitest for engine tests
- Maestro for mobile E2E flows

Validate Expo/EAS/dev-build behavior early because some ecosystem tooling may assume npm-like workflows.

## First Three Epics

### Epic 1: Project Foundation

Goal: create a modern Expo CNG app foundation suitable for native game dependencies and agentic development.

Includes:

- Expo app scaffold
- `src/app` Expo Router structure
- New Architecture enabled
- React Compiler evaluated/enabled where compatible
- Bun scripts
- TypeScript strict mode
- Expo ESLint and Prettier setup
- Skia installed
- Reanimated installed
- Gesture Handler installed
- Pulsar installed
- XState installed
- Vitest configured
- `.env.example`
- secret-safe config conventions
- initial docs

### Epic 2: Deterministic Engine Core

Goal: implement the core game rules without depending on rendering.

Includes:

- 6 x 12 grid model
- tile/suit model
- seeded RNG
- selector model
- input command model
- adjacent swap command
- match detection
- clearing
- falling/gravity
- chain resolution
- combo detection
- rising stack
- manual raise
- score model
- level/speed progression
- game-over detection
- replay fixtures
- board hash/state summary
- Vitest coverage

### Epic 3: Board Lab

Goal: prove the Skia rendering/input path before building the full game screen.

Includes:

- `/debug/board-lab`
- Skia-rendered board
- procedural card tiles
- four suit visuals
- selector rendering
- board scaling
- swap animation
- clear animation
- fall animation
- rise animation
- basic gesture input
- debug overlay
- FPS/frame timing
- seeded board fixture support

## Deferred Decisions

- final title and branding
- final card art style
- music direction
- public release tutorial design
- AI battle implementation
- multiplayer model
- leaderboard/cloud profile strategy
- crash reporting provider
- analytics provider
- RevenueCat product model
- AdMob usage
- asset licensing details
- tablet/foldable final layouts

## First Milestone Definition

The first playable graybox should demonstrate:

- Expo CNG app running on iOS and Android development builds
- 6 x 12 Skia board
- procedural four-suit card tiles
- selector-based adjacent swapping
- match detection
- clear/fall/chain resolution
- rising stack
- manual raise
- score basics
- deterministic seed/replay support
- debug board lab
- initial engine tests

It does not need:

- final art
- music
- monetization
- AI
- multiplayer
- onboarding
- production analytics
- app store polish

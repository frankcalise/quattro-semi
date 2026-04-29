# Quattro Semi

Quattro Semi is a portrait-first mobile puzzle game concept built around a deterministic rising-stack swap-match engine, React Native, Expo CNG, and Skia.

The game is inspired by Italian-suited playing cards and cozy tabletop play. It is a puzzle game, not a casino or gambling product.

## Current Status

This repository is becoming the initial Expo CNG scaffold for a custom-dev-client mobile game. The first implementation target is a playable graybox with a deterministic TypeScript engine, a Skia-rendered board, and debug routes for fast iteration.

Start here:

- [Vision](docs/vision.md)
- [Epics](docs/epics.md)

## Local Setup

Install dependencies with Bun:

```sh
bun install
```

Start the custom-dev-client Metro server:

```sh
bun run start
```

Native builds use Expo CNG:

```sh
bun run ios
bun run android
```

Validation:

```sh
bun run typecheck
bun run test
```

## License

Code is intended to be licensed under MIT. Original polished game assets may use a separate asset license later.

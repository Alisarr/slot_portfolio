# Level 3 — PixiJS Slot

The third stage of the slot portfolio: a tested 5×3 browser slot built with
TypeScript, Vite, PixiJS, and Vitest.

This project is an educational portfolio demo using virtual credits only. It is
not real-money gambling software.

## Current milestone

- PixiJS application bootstrap
- Static 5×3 placeholder board
- Typed board and payline models
- One left-to-right payline evaluator
- Unit tests for three-symbol wins and non-winning lines

## Run locally

Use Node.js 24 LTS.

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run build
```

## Project structure

```text
src/
  bonus/     Bonus-mode state and rules
  core/      Pure game types, paylines, RNG, and payout logic
  game/      Round orchestration and state machine
  view/      PixiJS rendering and animation
  main.ts    Application composition root
```

The `core` layer must not import PixiJS, browser DOM APIs, sound, or animation.
It should be possible to test every game rule without opening a browser.

## Planned bonus mode

Three or more Scatter symbols will enter a free-spins mode. Free spins will not
deduct balance, bonus wins will accumulate separately, Scatter symbols may
retrigger additional spins, and a Storm Wild meter will unlock an Overload spin.

The exact bonus math will be documented and tested before animation is added.

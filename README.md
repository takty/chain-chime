# Chain Chime

Vite + TypeScript + Alpine.js. Each timer is a card with its own settings. Cards stay in one row and scroll horizontally on narrow screens. The display uses HTML DOM elements and CSS only.

## Run and check

```sh
yarn install
yarn dev
yarn test
yarn build
```

Tests use Node.js 24, which can run TypeScript directly. Yarn uses the standard `node_modules` layout, configured in `.yarnrc.yml`, so VS Code can resolve Vite and other package types directly.

In VS Code, open a TypeScript file, run **TypeScript: Select TypeScript Version** from the Command Palette, and choose **Use Workspace Version**. The workspace settings point to `node_modules/typescript/lib`. If old diagnostics remain, run **TypeScript: Restart TS Server**.

## Deployment

Run `yarn build` and upload the contents of `dist` to the target directory, keeping the `assets` folder alongside `index.html`. For example, upload them to `https://takty.net/app/chain-chime/`.

`vite.config.ts` uses `base: './'`, so built asset URLs are relative to the page and work in a subdirectory. Open directory URLs with a trailing slash, such as `/app/chain-chime/`, or open `/app/chain-chime/index.html` directly.

## Files and customization

- `src/logic/`: State changes, timing, elapsed time calculations, and URL conversion. No dependency on the DOM or Alpine.
- `src/ui/app.html`: The page template with Alpine directives. `.timer-display` contains each timer's display.
- `src/ui/timer.css`: Cards, horizontal scrolling, time left, progress bars, and marks. Change the CSS variables at the top to adjust widths, spacing, text size, and colors.
- `src/ui/view.ts`: Display data, time formatting, and mark positions. Does not reference the timer logic.
- `src/ui/timer-scroll.ts`: Centers the running card in the horizontal list on start, resume, and timer changes. Repeated ticks leave manual scrolling alone. Resizing centers the running card again; reduced-motion settings disable smooth scrolling.
- `src/style.css`: Page layout and shared styles.
- `src/main.ts`: The only place that connects the UI, logic, clock, and browser URL.
- `src/logic/constants.ts`: Limits for duration, divisions, and timer count.

The UI displays a snapshot of the timer state and calls the actions passed in from `main.ts`. Each timer's elapsed time is calculated from total elapsed time rather than stored separately.

TypeScript files follow `coding-style.md`: tabs, semicolons, single quotes, explicit parameter and return types, aligned declarations where useful, and ECMAScript private fields. When the cards overflow the list, extra space at both ends lets the first and last card reach the center without scrolling the whole page.

## Confirmed additions to the spec

- The URL format is `?ts=1_50-3_30`: underscores separate timers, and a hyphen separates minutes from divisions. Omit division values of 0 or 1. Missing or zero division values are read as 1. The previous comma/colon format is not supported.
- If a URL contains more than 10 timers, use the first 10.
- Replace each out-of-range URL entry with a 3-minute timer with no divisions.
- Update the URL with `replaceState` only when settings change. Preserve other query parameters and the fragment. Do not normalize the URL on load.
- Disable all resets and settings while running. Enable them when paused.
- Allow settings changes and individual resets after completion. If elapsed time becomes less than the total duration, return to paused so the chain can resume.
- Run cards from left to right. Use the left and right buttons to reorder them.
- The overall progress panel has minus and plus buttons available in every state. Align elapsed seconds (including fractional seconds) to the local clock, then subtract or add one minute. Clamp to zero and total duration. Keep the current playback state unless reaching completion; adjusting back from completion returns to paused.

A division value of n means n equal parts, as stated in the spec. The minimum and default are 1. Show n-1 inner marks; 1 has no inner marks. There is no sound. Show the current timer and completion on screen.

## Test coverage

Automated tests use an injected clock to check sequential execution, pause and resume, editing after completion, clamping, reordering, resets, setting and count limits, URL conversion, and time formatting. Timing during device sleep depends on the browser's `performance.now()` behavior. Long sleep periods have not been tested on a physical device.

On 2026-09-27, all 18 automated tests and the production build passed. Browser checks covered a 1-minute timer completing, extending a completed timer, resetting one timer, disabled controls while running, resetting all timers after pausing, input changes, reordering, adding, deleting, and URL loading and updates. Layout was checked at viewport widths of 390px and 1280px. On narrow screens, only the card list scrolls horizontally. Touch input on a physical phone has not been tested.

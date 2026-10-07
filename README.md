# Chain Chime

Vite + TypeScript + Svelte 5 + Tailwind CSS. Each timer is a card with its own settings. Cards stay in one row and scroll horizontally on narrow screens. The display uses HTML DOM elements and CSS only.

## Run and check

```sh
yarn install
yarn dev
yarn test
yarn check
yarn build
```

Svelte is locked to 5.57.1 in `yarn.lock`, the latest stable npm release verified during this migration. TypeScript 6.0.3 is used to match the supported range of `svelte-check` 4.7.6.

Tests use Node.js 24, which can run TypeScript directly. Yarn uses the standard `node_modules` layout, configured in `.yarnrc.yml`, so VS Code can resolve Vite and other package types directly.

In VS Code, open a TypeScript file, run **TypeScript: Select TypeScript Version** from the Command Palette, and choose **Use Workspace Version**. The workspace settings point to `node_modules/typescript/lib`. If old diagnostics remain, run **TypeScript: Restart TS Server**.

## Deployment

Run `yarn build` and upload the contents of `dist` to the target directory, keeping the `assets` folder alongside `index.html`. For example, upload them to `https://takty.net/app/chain-chime/`.

`vite.config.ts` uses `base: './'`, so built asset URLs are relative to the page and work in a subdirectory. Open directory URLs with a trailing slash, such as `/app/chain-chime/`, or open `/app/chain-chime/index.html` directly.

## Files and customization

- `src/logic/`: State changes, timing, elapsed time calculations, and URL conversion. No dependency on the DOM or Svelte.
- `src/ui/app.svelte`: Composes the header, overall progress, and timer list.
- `src/ui/*.svelte`: Editable UI components with Tailwind CSS classes. The timer card composes `timer-actions.svelte` at the top (red SVG trash icon on the left, movement buttons on the right), `timer-display.svelte`, and `timer-settings.svelte`. The display places the separate `timer-reset.svelte` at the right end of its elapsed-time row. Adjust each component's classes to change its appearance.
- `src/ui/url-history.ts`: Groups numeric edits for 800 ms and commits them before other timer actions. Browser history and scheduling are injected from `main.ts`.
- `src/ui/timer-move.svelte` and `src/ui/elapsed-adjust.svelte`: Separate components for left/right and minus/plus controls. Each pair shares one rounded outer border with a single center divider and no gap; each half remains an accessible button.
- `public/icons/reset.svg` and `public/icons/trash.svg`: Standalone SVG files for the reset clock with two counterclockwise arrows and the red trash icon. Buttons load them as images using the configured base URL; SVG markup is not embedded in the components. Both individual and overall reset buttons use the clock icon, with accessible labels and tooltips.
- `src/style.css`: Tailwind theme colors and fonts. Layout and component styles are defined in the Svelte markup classes.
- `src/ui/view.ts`: Display data, time formatting, and mark positions. Does not reference the timer logic.
- `src/ui/timer-scroll.ts`: Centers the running card in the horizontal list on start, resume, and timer changes. Repeated ticks leave manual scrolling alone. Resizing centers the running card again; reduced-motion settings disable smooth scrolling. When the list overflows, reordering instantly scrolls the moved card so the same left/right button remains under the pointer. The destination card fades from half opacity to full opacity over 240 ms to indicate the move; reduced-motion settings disable this animation. Temporary end spacing permits repeated clicks through to the first or last position; starting playback restores the normal centering and scroll snapping.
- `src/main.ts`: The only place that connects the UI, logic, clock, and browser URL.
- `src/logic/constants.ts`: Limits for duration, divisions, and timer count.

Svelte components use typed `$props()` and receive display snapshots and actions. A Svelte store publishes updates from `main.ts`; timer calculations remain in ordinary TypeScript. `yarn check` checks both TypeScript and Svelte components.

The UI displays a snapshot of the timer state and calls the actions passed in from `main.ts`. Each timer's elapsed time is calculated from total elapsed time rather than stored separately.

TypeScript files follow `coding-style.md`: tabs, semicolons, single quotes, explicit parameter and return types, aligned declarations where useful, and ECMAScript private fields. When the cards overflow the list, extra space at both ends lets the first and last card reach the center without scrolling the whole page.

## Confirmed additions to the spec

- The URL format is `?ts=1_50-3_30`: underscores separate timers, and a hyphen separates minutes from divisions. Omit division values of 0 or 1. Missing or zero division values are read as 1. The previous comma/colon format is not supported.
- If a URL contains more than 10 timers, use the first 10.
- Replace each out-of-range URL entry with a 3-minute timer with no divisions.
- Add browser history with `pushState` only when the settings URL changes. Numeric changes update the timers immediately and commit the URL after 800 ms without another change, or before another timer operation. Also commit when the page is hidden or left. Preserve other query parameters and the fragment; do not normalize on load. Back/Forward restores settings from the URL with zero elapsed time in paused state.
- Below the overall progress bar, show the effective start time as current local time minus total elapsed time. Minute adjustments and resets recalculate it. While paused or completed, it moves with the current clock because it is calculated rather than stored.
- Put Reset all directly beside the overall elapsed/total display. Reserve the width of the completed `total / total` text using a hidden sizing span and tabular digits, so elapsed-time digit changes do not move the button. Recalculate the reserved width when timer settings change. Use smaller clock text on narrow screens to accommodate the maximum 600-minute configuration.
- Split the overall progress bar at timer boundaries using the same white marks as the individual bars. Segment widths are proportional to timer durations; individual division settings do not affect these boundaries. Duration, order, add, and delete changes recalculate the marks.
- Allow duration, division, and order changes while running. Account for the latest elapsed time before applying an edit and continue running, unless shortening reaches the new total duration and completes the chain. Keep adding, deleting, and individual/overall resets disabled while running; enable them when paused.
- Allow settings changes and individual resets after completion. If elapsed time becomes less than the total duration, return to paused so the chain can resume.
- Run cards from left to right. Use the left and right buttons to reorder them.
- The overall progress panel has minus and plus buttons available in every state. Align elapsed seconds (including fractional seconds) to the local clock, then subtract or add one minute. Clamp to zero and total duration. Keep the current playback state unless reaching completion; adjusting back from completion returns to paused.

A division value of n means n equal parts, as stated in the spec. The minimum and default are 1. Show n-1 inner marks; 1 has no inner marks. There is no sound. Show the current timer and completion on screen.

## Test coverage

Automated tests use an injected clock to check sequential execution, pause and resume, editing after completion, clamping, reordering, resets, setting and count limits, URL conversion, and time formatting. Timing during device sleep depends on the browser's `performance.now()` behavior. Long sleep periods have not been tested on a physical device.

On 2026-09-27, all 18 automated tests and the production build passed. Browser checks covered a 1-minute timer completing, extending a completed timer, resetting one timer, disabled controls while running, resetting all timers after pausing, input changes, reordering, adding, deleting, and URL loading and updates. Layout was checked at viewport widths of 390px and 1280px. On narrow screens, only the card list scrolls horizontally. Touch input on a physical phone has not been tested.

On 2026-10-06, after migrating to Svelte 5.57.1, all 24 automated tests and the production build passed; Svelte checks reported no errors or warnings. Browser checks covered settings changes, reordering, adding, deleting, start/pause, disabled controls while running, resets, minute adjustments, completion through adjustments, and extending a completed timer. At widths of 390px and 1280px, cards remained in one row; at 390px, overflow was confined to the timer list. Browser timing through a full natural completion and touch input on a physical phone were not rechecked in this migration.

Reorder-following scroll checks on 2026-10-06 covered five clicks at the same coordinates from the last card to the first at 1280px, and from the first card to the last at 390px. A list without overflow stayed at scrollLeft 0 after reordering. All 24 tests, Svelte checks, and the production build passed.

On 2026-10-08, all 30 tests and the production build passed; Svelte checks reported no errors or warnings. Browser checks covered grouped numeric history, Back/Forward settings restoration, committing edits before Add and Start, upper-row movement and deletion, individual resets, disabled controls during playback, and start-time updates with plus/minus. At 390px, document width remained 390px while the timer list's 630px content scrolled within its 358px width. Visibility/page-exit commits and physical-device touch were not tested in this check.

After enabling edits during playback on 2026-10-08, all 34 tests and the production build passed with no Svelte errors or warnings. Browser checks covered duration/division changes and reordering while time continued advancing, disabled deletion/resets, and their re-enabling on pause. At 390px, consecutive running reorder operations retained the same movement-button position, including after resize processing settled. Tests also covered shortening to completion, elapsed-time redistribution, and invalid edits.

import Alpine from 'alpinejs';
import './style.css';
import './ui/timer.css';
import template from './ui/app.html?raw';
import { TimerEngine } from './logic/engine.ts';
import { readTimers, writeTimers } from './logic/url.ts';
import {
	MAX_TIMER_COUNT,
	MIN_TIMER_MINUTES,
	MAX_TIMER_MINUTES,
	MIN_DIVISION_LINES,
	MAX_DIVISION_LINES,
} from './logic/constants.ts';
import { createView, formatClockTime } from './ui/view.ts';
import { TimerScroller } from './ui/timer-scroll.ts';
import type { TimerConfig } from './logic/timer.ts';
import type { Actions, DisplayTimer, TimerView } from './ui/view.ts';

// Connect the logic, UI, and browser APIs only in this file. --------------------

const REFRESH_INTERVAL_MS = 100;
const engine: TimerEngine = new TimerEngine(readTimers(window.location.href), (): number => performance.now());

function publish(): void {
	view.state = engine.snapshot();
	void Alpine.nextTick((): void => {
		const index: number = view.state.timers.findIndex((timer: DisplayTimer): boolean => timer.phase === 'current');
		scroller.update(view.state.status === 'running' ? index : null);
	});
}

function updateTitle(): void {
	const minutes: string = engine.configuration().map((timer: TimerConfig): number => timer.minutes).join('_');
	document.title = `Chain Chime ${minutes}`;
}

function edit(operation: () => boolean): void {
	if (!operation()) return;
	publish();
	updateTitle();
	try {
		window.history.replaceState(window.history.state, '', writeTimers(window.location.href, engine.configuration()));
		view.error = '';
	} catch {
		view.error = 'Settings changed, but the URL could not be updated.';
	}
}

const actions: Actions = {
	adjustElapsed(offset: -1 | 1): void {
		const now: Date = new Date();
		engine.adjustElapsed(offset, now.getSeconds() * 1000 + now.getMilliseconds());
		view.currentTime = formatClockTime(now);
		publish();
	},
	toggle(): void {
		if (engine.snapshot().status === 'running') engine.pause();
		else engine.start();
		publish();
	},
	reset(): void {
		engine.reset();
		publish();
	},
	resetTimer(index: number): void {
		engine.resetTimer(index);
		publish();
	},
	add(): void {
		edit((): boolean => engine.add());
	},
	remove(index: number): void {
		edit((): boolean => engine.remove(index));
	},
	move(index: number, offset: number): void {
		edit((): boolean => engine.move(index, offset));
	},
	update(index: number, field: 'minutes' | 'divisions', value: number): void {
		const timer: TimerConfig | undefined = engine.configuration()[index];
		if (timer) edit((): boolean => engine.update(index, { ...timer, [field]: value }));
	},
};

// UI setup --------------------------------------------------------------------

const view: TimerView = Alpine.reactive(createView(engine.snapshot(), actions, {
	minMinutes   : MIN_TIMER_MINUTES,
	maxMinutes   : MAX_TIMER_MINUTES,
	minDivisions : MIN_DIVISION_LINES,
	maxDivisions : MAX_DIVISION_LINES,
	maxCount     : MAX_TIMER_COUNT,
}));

view.currentTime = formatClockTime(new Date());
document.querySelector<HTMLDivElement>('#app')!.innerHTML = template;
const scroller: TimerScroller = new TimerScroller(document.querySelector<HTMLElement>('.timer-list')!);
Alpine.data('chainTimer', (): TimerView => view);
Alpine.start();
publish();
updateTitle();

// Measure time using the clock, not the number of callbacks. -------------------

function refresh(): void {
	view.currentTime = formatClockTime(new Date());
	if (engine.snapshot().status !== 'running') return;
	engine.tick();
	publish();
}

const interval: number = window.setInterval(refresh, REFRESH_INTERVAL_MS);
document.addEventListener('visibilitychange', refresh);
if (import.meta.hot) {
	import.meta.hot.dispose((): void => {
		window.clearInterval(interval);
		document.removeEventListener('visibilitychange', refresh);
		scroller.dispose();
	});
}

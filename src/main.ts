import { mount, unmount } from 'svelte';
import { writable } from 'svelte/store';
import './style.css';
import App from './ui/app.svelte';
import { TimerEngine } from './logic/engine.ts';
import { readTimers, writeTimers } from './logic/url.ts';
import {
	MAX_TIMER_COUNT,
	MIN_TIMER_MINUTES,
	MAX_TIMER_MINUTES,
	MIN_DIVISION_LINES,
	MAX_DIVISION_LINES,
} from './logic/constants.ts';
import { createView, formatClockTime, formatStartTime } from './ui/view.ts';
import { UrlHistory } from './ui/url-history.ts';
import type { TimerConfig } from './logic/timer.ts';
import type { Actions, TimerView } from './ui/view.ts';

// Connect the logic, UI, and browser APIs only in this file. --------------------

const REFRESH_INTERVAL_MS = 100;
let engine: TimerEngine = new TimerEngine(readTimers(window.location.href), (): number => performance.now());
const urlHistory = new UrlHistory({
	currentUrl: (): string => window.location.href,
	push: (url: string): void => window.history.pushState(window.history.state, '', url),
	schedule: (callback: () => void, delayMs: number): number => window.setTimeout(callback, delayMs),
	cancel: (id: number): void => window.clearTimeout(id),
	report: (error: string): void => {
		view.error = error;
		viewStore.set({ ...view });
	},
});

function publish(): void {
	view.state = engine.snapshot();
	const now: Date = new Date();
	view.currentTime = formatClockTime(now);
	view.startTime = formatStartTime(now, view.state.elapsedMs);
	viewStore.set({ ...view });
}

function updateTitle(): void {
	const minutes: string = engine.configuration().map((timer: TimerConfig): number => timer.minutes).join('_');
	document.title = `Chain Chime ${minutes}`;
}

function edit(operation: () => boolean, deferred: boolean = false): void {
	if (!deferred) urlHistory.flush();
	if (!operation()) return;
	publish();
	updateTitle();
	urlHistory.update(writeTimers(window.location.href, engine.configuration()), deferred);
}

const actions: Actions = {
	adjustElapsed(offset: -1 | 1): void {
		urlHistory.flush();
		const now: Date = new Date();
		engine.adjustElapsed(offset, now.getSeconds() * 1000 + now.getMilliseconds());
		view.currentTime = formatClockTime(now);
		publish();
	},
	toggle(): void {
		urlHistory.flush();
		if (engine.snapshot().status === 'running') engine.pause();
		else engine.start();
		publish();
	},
	reset(): void {
		urlHistory.flush();
		engine.reset();
		publish();
	},
	resetTimer(index: number): void {
		urlHistory.flush();
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
		if (timer) edit((): boolean => engine.update(index, { ...timer, [field]: value }), true);
	},
};

// UI setup --------------------------------------------------------------------

const view: TimerView = createView(engine.snapshot(), actions, {
	minMinutes   : MIN_TIMER_MINUTES,
	maxMinutes   : MAX_TIMER_MINUTES,
	minDivisions : MIN_DIVISION_LINES,
	maxDivisions : MAX_DIVISION_LINES,
	maxCount     : MAX_TIMER_COUNT,
});

// Keep input restoration connected to the latest snapshot after an action.
view.changeValue = view.changeValue.bind(view);

view.currentTime = formatClockTime(new Date());
const viewStore = writable<TimerView>({ ...view });
const app = mount(App, {
	target: document.querySelector<HTMLDivElement>('#app')!,
	props: { view: viewStore },
});
publish();
updateTitle();

// Measure time using the clock, not the number of callbacks. -------------------

function refresh(): void {
	engine.tick();
	publish();
}

function restoreFromUrl(): void {
	urlHistory.discard();
	engine = new TimerEngine(readTimers(window.location.href), (): number => performance.now());
	view.error = '';
	publish();
	updateTitle();
}

function handleVisibilityChange(): void {
	if (document.visibilityState === 'hidden') urlHistory.flush();
	refresh();
}

function handlePageHide(): void {
	urlHistory.flush();
}

const interval: number = window.setInterval(refresh, REFRESH_INTERVAL_MS);
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('popstate', restoreFromUrl);
window.addEventListener('pagehide', handlePageHide);
if (import.meta.hot) {
	import.meta.hot.dispose((): void => {
		window.clearInterval(interval);
		urlHistory.discard();
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('popstate', restoreFromUrl);
		window.removeEventListener('pagehide', handlePageHide);
		void unmount(app);
	});
}

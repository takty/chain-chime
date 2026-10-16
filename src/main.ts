import { mount, unmount } from 'svelte';
import { writable } from 'svelte/store';
import './style.css';
import App from './ui/app.svelte';
import { TimerEngine } from './logic/engine.ts';
import { AutoStart } from './logic/auto-start.ts';
import { createSleepAwareClock } from './logic/clock.ts';
import { readTimers, writeTimers, serializeTimers } from './logic/url.ts';
import { TimerPresets, TIMER_PRESETS_KEY, parsePreset } from './logic/timer-presets.ts';
import {
	MAX_TIMER_COUNT,
	MIN_TIMER_MINUTES,
	MAX_TIMER_MINUTES,
	MIN_DIVISION_LINES,
	MAX_DIVISION_LINES,
} from './logic/constants.ts';
import { createView, formatClockTime, updateClockDisplay } from './ui/view.ts';
import { UrlHistory } from './ui/url-history.ts';
import type { TimerConfig } from './logic/timer.ts';
import type { Actions, TimerView } from './ui/view.ts';

// Connect the logic, UI, and browser APIs only in this file. --------------------

const REFRESH_INTERVAL_MS = 100;
const autoStart = new AutoStart();
const presets = new TimerPresets({
	read: (): string | null => window.localStorage.getItem(TIMER_PRESETS_KEY),
	write: (value: string): void => window.localStorage.setItem(TIMER_PRESETS_KEY, value),
});
const timerClock = createSleepAwareClock((): number => performance.now(), (): number => Date.now());
let engine: TimerEngine = new TimerEngine(readTimers(window.location.href), timerClock);
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

function publish(now: Date = new Date(), rebaseStart: boolean = false): void {
	view.state = engine.snapshot();
	updateClockDisplay(view, now, rebaseStart);
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

function updatePresets(operation: () => void): void {
	try {
		operation();
		view.savedTimers = presets.values();
		view.error = '';
	} catch {
		view.error = 'Saved timers could not be read or written. Check browser storage permissions.';
	}
	publish();
}

const actions: Actions = {
	savePreset(): void {
		if (engine.snapshot().status === 'running') return;
		updatePresets((): void => { presets.load(); presets.save(engine.configuration()); });
	},
	removePreset(): void {
		if (engine.snapshot().status === 'running') return;
		updatePresets((): void => { presets.load(); presets.remove(serializeTimers(engine.configuration())); });
	},
	loadPreset(value: string): void {
		if (engine.snapshot().status === 'running' || !presets.values().includes(value)) return;
		const timers: TimerConfig[] | null = parsePreset(value);
		if (!timers) return;
		urlHistory.flush();
		engine = new TimerEngine(timers, timerClock);
		publish(new Date(), true);
		updateTitle();
		urlHistory.update(writeTimers(window.location.href, timers));
	},
	setAutoStartTime(time: string | null): void {
		const now: Date = new Date();
		if (!autoStart.setTime(time, now)) return;
		view.autoStartTime = time;
		publish(now);
	},
	adjustElapsed(offset: -1 | 1): void {
		urlHistory.flush();
		const now: Date = new Date();
		engine.adjustElapsed(offset, now.getSeconds() * 1000 + now.getMilliseconds());
		publish(now, true);
	},
	toggle(): void {
		urlHistory.flush();
		const now: Date = new Date();
		if (engine.snapshot().status === 'running') engine.pause();
		else engine.start();
		publish(now, true);
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
updatePresets((): void => presets.load());
updateTitle();

// Measure time using the clock, not the number of callbacks. -------------------

function refresh(): void {
	engine.tick();
	const now: Date = new Date();
	const start: boolean = autoStart.shouldStart(now, engine.snapshot().status === 'paused');
	if (start) {
		urlHistory.flush();
		engine.start();
	}
	publish(now, start);
}

function restoreFromUrl(): void {
	urlHistory.discard();
	engine = new TimerEngine(readTimers(window.location.href), timerClock);
	view.error = '';
	publish();
	updateTitle();
}

function handleVisibilityChange(): void {
	if (document.visibilityState === 'hidden') urlHistory.flush();
	refresh();
}

function handleStorage(event: StorageEvent): void {
	if (event.key === TIMER_PRESETS_KEY || event.key === null) updatePresets((): void => presets.load());
}

function handlePageHide(): void {
	urlHistory.flush();
}

const interval: number = window.setInterval(refresh, REFRESH_INTERVAL_MS);
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('popstate', restoreFromUrl);
window.addEventListener('pagehide', handlePageHide);
window.addEventListener('storage', handleStorage);
if (import.meta.hot) {
	import.meta.hot.dispose((): void => {
		window.clearInterval(interval);
		urlHistory.discard();
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('popstate', restoreFromUrl);
		window.removeEventListener('pagehide', handlePageHide);
		window.removeEventListener('storage', handleStorage);
		void unmount(app);
	});
}

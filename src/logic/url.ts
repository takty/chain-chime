import { MAX_TIMER_COUNT } from './constants.ts';
import { createDefaultTimer, isValidTimer } from './timer.ts';
import type { TimerConfig } from './timer.ts';

/** Keep the URL unchanged on load. Replace only invalid entries with defaults. */
export function readTimers(url: string): TimerConfig[] {
	const value: string | null = new URL(url).searchParams.get('timers');
	if (value === null) return [createDefaultTimer()];
	return value.split('_').slice(0, MAX_TIMER_COUNT).map((part: string): TimerConfig => {
		if (!/^\d+(?:-\d+)?$/.test(part)) return createDefaultTimer();
		const [minutes, divisions = 0] = part.split('-').map(Number);
		const timer: TimerConfig = { minutes, divisions };
		return isValidTimer(timer) ? timer : createDefaultTimer();
	});
}

export function writeTimers(url: string, timers: readonly TimerConfig[]): string {
	const next: URL = new URL(url);
	const value: string = timers.map((t: TimerConfig): string => t.divisions === 0 ? `${t.minutes}` : `${t.minutes}-${t.divisions}`).join('_');
	next.searchParams.set('timers', value);
	return next.href;
}

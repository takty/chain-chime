import {
	DEFAULT_DIVISION_LINES,
	DEFAULT_TIMER_MINUTES,
	MAX_DIVISION_LINES,
	MAX_TIMER_COUNT,
	MAX_TIMER_MINUTES,
	MILLISECONDS_PER_MINUTE,
	MIN_DIVISION_LINES,
	MIN_TIMER_COUNT,
	MIN_TIMER_MINUTES,
} from './constants.ts';

export interface TimerConfig {
	readonly minutes   : number;
	readonly divisions : number;
}

export interface TimerProgress {
	readonly index       : number;
	readonly minutes     : number;
	readonly divisions   : number;
	readonly startMs     : number;
	readonly durationMs  : number;
	readonly elapsedMs   : number;
	readonly remainingMs : number;
	readonly progress    : number;
	readonly phase       : 'waiting' | 'current' | 'finished';
}

export function createDefaultTimer(): TimerConfig {
	return { minutes: DEFAULT_TIMER_MINUTES, divisions: DEFAULT_DIVISION_LINES };
}

export function isValidTimer(timer: TimerConfig): boolean {
	return Number.isInteger(timer.minutes)
		&& timer.minutes >= MIN_TIMER_MINUTES && timer.minutes <= MAX_TIMER_MINUTES
		&& Number.isInteger(timer.divisions)
		&& timer.divisions >= MIN_DIVISION_LINES && timer.divisions <= MAX_DIVISION_LINES;
}

export function isValidTimerList(timers: readonly TimerConfig[]): boolean {
	return timers.length >= MIN_TIMER_COUNT && timers.length <= MAX_TIMER_COUNT
		&& timers.every(isValidTimer);
}

export function totalDuration(timers: readonly TimerConfig[]): number {
	return timers.reduce((total: number, timer: TimerConfig): number => total + timer.minutes * MILLISECONDS_PER_MINUTE, 0);
}

export function clampElapsed(timers: readonly TimerConfig[], elapsedMs: number): number {
	return Math.min(Math.max(0, elapsedMs), totalDuration(timers));
}

/** Derive each timer's progress from total elapsed time instead of storing it. */
export function deriveProgress(timers: readonly TimerConfig[], elapsedMs: number): TimerProgress[] {
	let startMs: number = 0;
	return timers.map((timer: TimerConfig, index: number): TimerProgress => {
		const durationMs: number = timer.minutes * MILLISECONDS_PER_MINUTE;
		const localElapsed: number = Math.min(Math.max(elapsedMs - startMs, 0), durationMs);
		const result: TimerProgress = {
			...timer,
			index,
			startMs,
			durationMs,
			elapsedMs   : localElapsed,
			remainingMs : durationMs - localElapsed,
			progress    : localElapsed / durationMs,
			phase       : elapsedMs >= startMs + durationMs ? 'finished'
				: elapsedMs >= startMs ? 'current' : 'waiting',
		};
		startMs += durationMs;
		return result;
	});
}

/** Do not advance time when resetting a timer that has not started. */
export function rewindToTimer(timers: readonly TimerConfig[], elapsedMs: number, index: number): number {
	if (!Number.isInteger(index) || index < 0 || index >= timers.length) return elapsedMs;
	const startMs: number = totalDuration(timers.slice(0, index));
	return Math.min(elapsedMs, startMs);
}

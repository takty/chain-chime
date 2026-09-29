import type { TimerConfig, TimerProgress } from '../src/logic/timer.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { clampElapsed, deriveProgress, isValidTimer, rewindToTimer } from '../src/logic/timer.ts';

const minutes = (value: number): number => value * 60_000;
const timers = [10, 50, 30].map((value: number): TimerConfig => ({ minutes: value, divisions: 1 }));

test('distributes 35 minutes as 10, 25, and 0 minutes', (): void => {
	assert.deepEqual(deriveProgress(timers, minutes(35)).map((t: TimerProgress): number => t.elapsedMs), [10, 25, 0].map(minutes));
});

test('redistributes the same total elapsed time after reordering', (): void => {
	assert.deepEqual(deriveProgress([...timers].reverse(), minutes(30)).map((t: TimerProgress): number => t.elapsedMs), [30, 0, 0].map(minutes));
});

test('shortening a timer moves elapsed time into later timers', (): void => {
	const edited = [timers[0], { minutes: 10, divisions: 1 }, timers[2]];
	assert.deepEqual(deriveProgress(edited, minutes(35)).map((t: TimerProgress): number => t.elapsedMs), [10, 10, 15].map(minutes));
	assert.equal(clampElapsed(edited, minutes(70)), minutes(50));
});

test('resetting a timer rewinds to its start without moving time forward', (): void => {
	assert.equal(rewindToTimer(timers, minutes(65), 1), minutes(10));
	assert.equal(rewindToTimer(timers, minutes(5), 2), minutes(5));
});

test('selects the next timer at a time boundary', (): void => {
	assert.deepEqual(deriveProgress(timers, minutes(10)).map((t: TimerProgress): 'waiting' | 'current' | 'finished' => t.phase), ['finished', 'current', 'waiting']);
	assert.ok(deriveProgress(timers, minutes(90)).every((t: TimerProgress): boolean => t.phase === 'finished'));
});

test('validates integers and range limits', (): void => {
	assert.equal(isValidTimer({ minutes: 1, divisions: 1 }), true);
	assert.equal(isValidTimer({ minutes: 60, divisions: 20 }), true);
	for (const value of [0, 61, 1.5, NaN, Infinity]) {
		assert.equal(isValidTimer({ minutes: value, divisions: 1 }), false);
	}
	for (const value of [-1, 0, 21, 1.5, NaN]) {
		assert.equal(isValidTimer({ minutes: 3, divisions: value }), false);
	}
});

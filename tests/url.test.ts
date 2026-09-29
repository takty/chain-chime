import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readTimers, writeTimers } from '../src/logic/url.ts';

test('uses defaults for missing, empty, and invalid URL entries', (): void => {
	for (const query of ['', '?ts=', '?ts=abc']) {
		assert.deepEqual(readTimers(`https://example.test/${query}`), [{ minutes: 3, divisions: 1 }]);
	}
	assert.deepEqual(readTimers('https://example.test/?ts=10-5__61_10-21_30'), [
		{ minutes: 10, divisions: 5 }, { minutes: 3, divisions: 1 },
		{ minutes: 3, divisions: 1 }, { minutes: 3, divisions: 1 }, { minutes: 30, divisions: 1 },
	]);
});

test('reads only the first 10 timers from the URL', (): void => {
	const timers = readTimers(`https://example.test/?ts=${Array.from({ length: 12 }, (_: unknown, i: number): number => i + 1).join('_')}`);
	assert.equal(timers.length, 10);
	assert.equal(timers[9].minutes, 10);
});

test('normalizes settings and preserves other parameters and the fragment', (): void => {
	const original = 'https://example.test/?mode=lecture&ts=10-0_abc#timer';
	const result = new URL(writeTimers(original, readTimers(original)));
	assert.equal(result.searchParams.get('ts'), '10_3');
	assert.equal(result.searchParams.get('mode'), 'lecture');
	assert.equal(result.hash, '#timer');
});

test('writes readable separators and reads the same settings back', (): void => {
	const timers = [
		{ minutes: 1, divisions: 1 },
		{ minutes: 50, divisions: 3 },
		{ minutes: 30, divisions: 1 },
	];
	const result: string = writeTimers('https://example.test/', timers);
	assert.equal(result, 'https://example.test/?ts=1_50-3_30');
	assert.deepEqual(readTimers(result), timers);
});

test('normalizes omitted, zero, and one divisions without losing durations', (): void => {
	const url: string = 'https://example.test/?ts=10_20-0_30-1_40-2';
	const timers = readTimers(url);
	assert.deepEqual(timers, [
		{ minutes: 10, divisions: 1 },
		{ minutes: 20, divisions: 1 },
		{ minutes: 30, divisions: 1 },
		{ minutes: 40, divisions: 2 },
	]);
	assert.equal(writeTimers(url, timers), 'https://example.test/?ts=10_20_30_40-2');
	assert.equal(writeTimers(url, [{ minutes: 10, divisions: 0 }, { minutes: 20, divisions: 1 }]), 'https://example.test/?ts=10_20');
});

test('does not interpret legacy separators and falls back per entry', (): void => {
	for (const value of ['1,50:3,30', '1%2C50%3A3%2C30', '50:3', '50.3']) {
		assert.deepEqual(readTimers(`https://example.test/?ts=${value}`), [{ minutes: 3, divisions: 1 }]);
	}
	assert.deepEqual(readTimers('https://example.test/?ts=1_50:3_30'), [
		{ minutes: 1, divisions: 1 },
		{ minutes: 3, divisions: 1 },
		{ minutes: 30, divisions: 1 },
	]);
});

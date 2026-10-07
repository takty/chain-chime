import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatTime, formatStartTime } from '../src/ui/view.ts';

test('rounds time left up and elapsed time down', (): void => {
	assert.equal(formatTime(59_001, true), '1′00″');
	assert.equal(formatTime(59_001), '0′59″');
	assert.equal(formatTime(0, true), '0′00″');
	assert.equal(formatTime(600 * 60_000), '600′00″');
});

test('derives start time from wall clock and elapsed time, including adjustments and midnight', (): void => {
	const now: Date = new Date(2026, 9, 8, 10, 12, 20, 500);
	assert.equal(formatStartTime(now, 0), '10:12');
	assert.equal(formatStartTime(now, 4 * 60_000 + 20_500), '10:08');
	assert.equal(formatStartTime(now, 2 * 60_000 + 20_500), '10:10');
	assert.equal(formatStartTime(new Date(2026, 9, 8, 0, 1), 2 * 60_000), '23:59');
});

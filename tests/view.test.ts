import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatTime } from '../src/ui/view.ts';

test('rounds time left up and elapsed time down', (): void => {
	assert.equal(formatTime(59_001, true), '1′00″');
	assert.equal(formatTime(59_001), '0′59″');
	assert.equal(formatTime(0, true), '0′00″');
	assert.equal(formatTime(600 * 60_000), '600′00″');
});

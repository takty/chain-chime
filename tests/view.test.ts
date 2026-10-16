import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatTime, formatStartTime, updateClockDisplay } from '../src/ui/view.ts';
import { TimerEngine } from '../src/logic/engine.ts';

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


test('holds the adjusted start minute across clock jitter and rebases on another adjustment', (): void => {
	let clock: number = 0;
	const engine = new TimerEngine([{ minutes: 10, divisions: 1 }], (): number => clock);
	engine.start();
	const wallBase: number = new Date(2026, 9, 16, 9, 13, 20, 500).getTime();
	engine.adjustElapsed(1, 20_500);
	const view = { state: engine.snapshot(), currentTime: '', startTime: '' };
	updateClockDisplay(view, new Date(wallBase), true);
	assert.equal(view.startTime, '09:12');

	for (const [wallDelta, clockDelta] of [[100, 100.2], [200, 199.8], [300, 300.2], [400, 399.8]]) {
		clock = clockDelta;
		engine.tick();
		view.state = engine.snapshot();
		updateClockDisplay(view, new Date(wallBase + wallDelta));
		assert.equal(view.startTime, '09:12');
	}

	engine.adjustElapsed(-1, 20_900);
	view.state = engine.snapshot();
	updateClockDisplay(view, new Date(wallBase + 400), true);
	assert.equal(view.startTime, '09:13');
});

test('updates while paused or completed and captures a new start time on resume', (): void => {
	let clock: number = 0;
	const engine = new TimerEngine([{ minutes: 10, divisions: 1 }], (): number => clock);
	const wallBase: number = new Date(2026, 9, 16, 9, 12).getTime();
	const view = { state: engine.snapshot(), currentTime: '', startTime: '' };
	const publish = (wallDelta: number, rebase: boolean = false): void => {
		view.state = engine.snapshot();
		updateClockDisplay(view, new Date(wallBase + wallDelta), rebase);
	};
	publish(0);
	assert.equal(view.startTime, '09:12');
	engine.start();
	publish(0, true);
	clock = 60_000;
	engine.pause();
	publish(60_000);
	assert.equal(view.startTime, '09:12');
	publish(120_000);
	assert.equal(view.startTime, '09:13');
	engine.start();
	publish(180_000, true);
	assert.equal(view.startTime, '09:14');
	clock = 120_000;
	engine.tick();
	publish(240_000);
	assert.equal(view.startTime, '09:14');
	assert.equal(view.currentTime, '09:16');
	clock = 600_000;
	engine.tick();
	publish(720_000);
	assert.equal(view.state.status, 'completed');
	assert.equal(view.startTime, '09:14');
	publish(780_000);
	assert.equal(view.startTime, '09:15');
	engine.reset();
	publish(780_000);
	assert.equal(view.startTime, '09:25');
});

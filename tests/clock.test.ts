import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSleepAwareClock } from '../src/logic/clock.ts';
import { TimerEngine } from '../src/logic/engine.ts';

function setup() {
	let performanceTime: number = 123.25;
	let dateTime: number = 1_800_000_000_000;
	const now = createSleepAwareClock((): number => performanceTime, (): number => dateTime);
	return {
		now,
		advance(performanceMs: number, dateMs: number): void {
			performanceTime += performanceMs;
			dateTime += dateMs;
		},
	};
}

test('preserves fractional monotonic time even after a long callback delay', (): void => {
	const clock = setup();
	const initial = clock.now();
	clock.advance(60_000.5, 60_001);
	assert.equal(clock.now() - initial, 60_000.5);
});

test('corrects the full missing time only above ten seconds and retains repeated corrections', (): void => {
	const clock = setup();
	const initial = clock.now();
	clock.advance(100, 10_100);
	assert.equal(clock.now() - initial, 100);
	clock.advance(2_000, 60_000);
	assert.equal(clock.now() - initial, 60_100);
	assert.equal(clock.now() - initial, 60_100);
	clock.advance(100.5, 101);
	assert.equal(clock.now() - initial, 60_200.5);
	clock.advance(0, 30_000);
	assert.equal(clock.now() - initial, 90_200.5);
});

test('ignores negative wall-clock differences and updates the baseline', (): void => {
	const clock = setup();
	const initial = clock.now();
	clock.advance(100, -60_000);
	assert.equal(clock.now() - initial, 100);
	clock.advance(100, 100);
	assert.equal(clock.now() - initial, 200);
});

test('timer includes sleep while running, excludes paused sleep, and completes after sleep', (): void => {
	const clock = setup();
	const engine = new TimerEngine([{ minutes: 1, divisions: 1 }, { minutes: 2, divisions: 1 }], clock.now);
	engine.start();
	clock.advance(2_000, 70_000);
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 70_000);
	assert.equal(engine.snapshot().timers[1].elapsedMs, 10_000);
	engine.pause();
	clock.advance(0, 60_000);
	engine.start();
	clock.advance(500, 500);
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 70_500);
	clock.advance(0, 120_000);
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 180_000);
	assert.equal(engine.snapshot().status, 'completed');
});

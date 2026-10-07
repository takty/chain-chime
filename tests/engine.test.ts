import type { TimerConfig, TimerProgress } from '../src/logic/timer.ts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TimerEngine } from '../src/logic/engine.ts';

interface TestClock {
	engine: TimerEngine;
	advance(minutes: number): void;
}

function setup(durations: number[] = [10, 50, 30]): TestClock {
	let now: number = 0;
	const engine = new TimerEngine(durations.map((minutes: number): TimerConfig => ({ minutes, divisions: 1 })), (): number => now);
	return {
		engine,
		advance(minutes: number): void {
			now += minutes * 60_000;
			engine.tick();
		},
	};
}

test('starts paused, excludes paused time, and advances across timers after a delayed tick', (): void => {
	const { engine, advance } = setup();
	advance(5);
	assert.equal(engine.snapshot().elapsedMs, 0);
	engine.start();
	advance(35);
	assert.deepEqual(engine.snapshot().timers.map((t: TimerProgress): number => t.elapsedMs / 60_000), [10, 25, 0]);
	engine.pause();
	advance(10);
	engine.start();
	advance(1);
	assert.equal(engine.snapshot().elapsedMs, 36 * 60_000);
});

test('stops at the total duration and can restart after resetting one timer', (): void => {
	const { engine, advance } = setup();
	engine.start();
	advance(100);
	assert.equal(engine.snapshot().status, 'completed');
	assert.equal(engine.snapshot().elapsedMs, 90 * 60_000);
	engine.start();
	advance(5);
	assert.equal(engine.snapshot().status, 'completed');
	engine.resetTimer(1);
	assert.equal(engine.snapshot().status, 'paused');
	assert.equal(engine.snapshot().elapsedMs, 10 * 60_000);
	engine.start();
	assert.equal(engine.snapshot().status, 'running');
});

test('returns to paused when a timer is added or extended after completion', (): void => {
	const { engine, advance } = setup([1]);
	engine.start();
	advance(1);
	assert.equal(engine.update(0, { minutes: 2, divisions: 1 }), true);
	assert.equal(engine.snapshot().status, 'paused');
	engine.start();
	advance(1);
	assert.equal(engine.add(), true);
	assert.equal(engine.snapshot().status, 'paused');
});

test('rejects adding, deleting, and resets while running', (): void => {
	const { engine, advance } = setup();
	engine.start();
	advance(5);
	assert.equal(engine.add(), false);
	assert.equal(engine.remove(0), false);
	assert.equal(engine.snapshot().canAdd, false);
	assert.equal(engine.snapshot().canRemove, false);
	assert.equal(engine.snapshot().canReset, false);
	engine.resetTimer(0);
	engine.reset();
	assert.equal(engine.snapshot().elapsedMs, 5 * 60_000);
	engine.pause();
	engine.reset();
	assert.equal(engine.snapshot().elapsedMs, 0);
	assert.equal(engine.snapshot().status, 'paused');
});

test('reorders while running using the latest elapsed time and continues without double counting', (): void => {
	let now: number = 0;
	const engine = new TimerEngine([{ minutes: 10, divisions: 1 }, { minutes: 50, divisions: 1 }, { minutes: 30, divisions: 1 }], (): number => now);
	engine.start();
	now = 35 * 60_000;
	assert.equal(engine.move(2, -2), true);
	assert.equal(engine.snapshot().status, 'running');
	assert.equal(engine.snapshot().elapsedMs, now);
	assert.deepEqual(engine.snapshot().timers.map((timer: TimerProgress): number => timer.elapsedMs / 60_000), [30, 5, 0]);
	now += 500;
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 35 * 60_000 + 500);
});

test('edits durations and divisions while running and redistributes the latest elapsed time', (): void => {
	let now: number = 0;
	const engine = new TimerEngine([{ minutes: 10, divisions: 1 }, { minutes: 50, divisions: 1 }, { minutes: 30, divisions: 1 }], (): number => now);
	engine.start();
	now = 35 * 60_000;
	assert.equal(engine.update(1, { minutes: 10, divisions: 3 }), true);
	assert.equal(engine.snapshot().status, 'running');
	assert.deepEqual(engine.snapshot().timers.map((timer: TimerProgress): number => timer.elapsedMs / 60_000), [10, 10, 15]);
	now += 500;
	assert.equal(engine.update(2, { minutes: 30, divisions: 5 }), true);
	assert.equal(engine.snapshot().elapsedMs, now);
	assert.equal(engine.snapshot().timers[2].divisions, 5);
	now += 500;
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 35 * 60_000 + 1000);
});

test('shortening during playback completes the chain and extending it does not resume automatically', (): void => {
	const { engine, advance } = setup([10, 10]);
	engine.start();
	advance(15);
	assert.equal(engine.update(1, { minutes: 1, divisions: 1 }), true);
	assert.equal(engine.snapshot().status, 'completed');
	assert.equal(engine.snapshot().elapsedMs, 11 * 60_000);
	assert.equal(engine.snapshot().canReset, true);
	advance(1);
	assert.equal(engine.update(1, { minutes: 10, divisions: 1 }), true);
	assert.equal(engine.snapshot().status, 'paused');
	assert.equal(engine.snapshot().elapsedMs, 11 * 60_000);
});

test('rejects invalid settings and reorder positions during playback', (): void => {
	const { engine } = setup([10, 20]);
	engine.start();
	assert.equal(engine.update(0, { minutes: 0, divisions: 1 }), false);
	assert.equal(engine.update(0, { minutes: 10, divisions: 21 }), false);
	assert.equal(engine.update(-1, { minutes: 10, divisions: 1 }), false);
	assert.equal(engine.move(0, -1), false);
	assert.equal(engine.move(0, 0.5), false);
	assert.deepEqual(engine.configuration(), [{ minutes: 10, divisions: 1 }, { minutes: 20, divisions: 1 }]);
	assert.equal(engine.snapshot().status, 'running');
});

test('reset all returns a completed chain to its initial paused state', (): void => {
	const { engine, advance } = setup([1]);
	engine.start();
	advance(1);
	engine.reset();
	assert.equal(engine.snapshot().elapsedMs, 0);
	assert.equal(engine.snapshot().status, 'paused');
});

test('reordering keeps total elapsed time and applies it to the new order', (): void => {
	const { engine, advance } = setup();
	engine.start();
	advance(35);
	engine.pause();
	engine.move(2, -2);
	assert.deepEqual(engine.snapshot().timers.map((t: TimerProgress): number => t.elapsedMs / 60_000), [30, 5, 0]);
	assert.equal(engine.snapshot().elapsedMs, 35 * 60_000);
});

test('extending the chain does not restore elapsed time discarded by shortening it', (): void => {
	const { engine, advance } = setup([60, 30]);
	engine.start();
	advance(70);
	engine.pause();
	engine.remove(1);
	assert.equal(engine.snapshot().elapsedMs, 60 * 60_000);
	engine.add();
	assert.equal(engine.snapshot().elapsedMs, 60 * 60_000);
});

test('aligns seconds before adding or subtracting a minute while paused', (): void => {
	for (const offset of [-1, 1] as const) {
		const { engine, advance } = setup();
		engine.start();
		advance(3.75);
		engine.pause();
		engine.adjustElapsed(offset, 20_500);
		assert.equal(engine.snapshot().elapsedMs, (3 + offset) * 60_000 + 20_500);
		assert.equal(engine.snapshot().status, 'paused');
		advance(1);
		assert.equal(engine.snapshot().elapsedMs, (3 + offset) * 60_000 + 20_500);
	}
});

test('adjusts from the latest running time and crosses timer boundaries in both directions', (): void => {
	let now: number = 0;
	const engine = new TimerEngine([{ minutes: 1, divisions: 1 }, { minutes: 3, divisions: 1 }], (): number => now);
	engine.start();
	now = 65_000;
	engine.adjustElapsed(1, 20_500);
	assert.equal(engine.snapshot().elapsedMs, 140_500);
	assert.equal(engine.snapshot().status, 'running');
	assert.equal(engine.snapshot().timers[1].phase, 'current');
	now += 500;
	engine.tick();
	assert.equal(engine.snapshot().elapsedMs, 141_000);
	engine.adjustElapsed(-1, 21_000);
	engine.adjustElapsed(-1, 21_000);
	assert.equal(engine.snapshot().elapsedMs, 21_000);
	assert.equal(engine.snapshot().timers[0].phase, 'current');
	assert.equal(engine.snapshot().status, 'running');
});

test('clamps adjustments and allows adjusting after completion', (): void => {
	const { engine, advance } = setup([1]);
	engine.adjustElapsed(-1, 20_000);
	assert.equal(engine.snapshot().elapsedMs, 0);
	engine.start();
	engine.adjustElapsed(-1, 20_000);
	assert.equal(engine.snapshot().status, 'running');
	engine.adjustElapsed(1, 20_000);
	assert.equal(engine.snapshot().elapsedMs, 60_000);
	assert.equal(engine.snapshot().status, 'completed');
	advance(1);
	engine.adjustElapsed(1, 20_000);
	assert.equal(engine.snapshot().elapsedMs, 60_000);
	engine.adjustElapsed(-1, 20_000);
	assert.equal(engine.snapshot().elapsedMs, 20_000);
	assert.equal(engine.snapshot().status, 'paused');
	engine.start();
	advance(0.5);
	assert.equal(engine.snapshot().elapsedMs, 50_000);
});

test('enforces timer count limits and prevents changes through returned data', (): void => {
	const { engine } = setup([3]);
	assert.equal(engine.remove(0), false);
	for (let i = 0; i < 9; i++) assert.equal(engine.add(), true);
	assert.equal(engine.add(), false);
	engine.configuration().splice(0);
	assert.equal(engine.snapshot().timers.length, 10);
});

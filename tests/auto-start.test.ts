import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AutoStart } from '../src/logic/auto-start.ts';
import { TimerEngine } from '../src/logic/engine.ts';

const at = (day: number, hours: number, minutes: number, seconds: number = 0, ms: number = 0): Date => new Date(2026, 9, day, hours, minutes, seconds, ms);

test('defaults to disabled and accepts midnight separately from disabled', (): void => {
	const auto = new AutoStart();
	assert.equal(auto.shouldStart(at(16, 23, 59), true), false);
	assert.equal(auto.shouldStart(at(17, 0, 0), true), false);
	auto.setTime('00:00', at(17, 23, 59, 59));
	assert.equal(auto.shouldStart(at(18, 0, 0, 0, 100), true), true);
	auto.setTime(null, at(18, 23, 59));
	assert.equal(auto.shouldStart(at(19, 0, 0), true), false);
});

test('starts once at the selected boundary and repeats the next day', (): void => {
	const auto = new AutoStart();
	auto.setTime('09:00', at(16, 8, 59, 59));
	assert.equal(auto.shouldStart(at(16, 8, 59, 59, 900), true), false);
	assert.equal(auto.shouldStart(at(16, 9, 0, 0, 100), true), true);
	assert.equal(auto.shouldStart(at(16, 9, 0, 5), true), false);
	assert.equal(auto.shouldStart(at(16, 9, 0, 59), true), false);
	assert.equal(auto.shouldStart(at(17, 9, 0), true), true);
});

test('consumes the boundary while running or completed without starting after a pause or reset', (): void => {
	for (const status of ['running', 'completed'] as const) {
		const auto = new AutoStart();
		auto.setTime('09:00', at(16, 8, 59));
		assert.equal(auto.shouldStart(at(16, 9, 0), status === ('paused' as string)), false);
		assert.equal(auto.shouldStart(at(16, 9, 0, 5), true), false);
		assert.equal(auto.shouldStart(at(17, 9, 0), true), true);
	}
});

test('setting the current or past minute does not start immediately', (): void => {
	for (const now of [at(16, 9, 0), at(16, 9, 0, 30), at(16, 10, 0)]) {
		const auto = new AutoStart();
		auto.setTime('09:00', now);
		assert.equal(auto.shouldStart(new Date(now.getTime() + 100), true), false);
		assert.equal(auto.shouldStart(at(17, 9, 0), true), true);
	}
});

test('does not catch up after missing the scheduled minute', (): void => {
	const auto = new AutoStart();
	auto.setTime('09:00', at(16, 8, 59));
	assert.equal(auto.shouldStart(at(16, 9, 1), true), false);
	assert.equal(auto.shouldStart(at(17, 9, 0), true), true);
});

test('does not repeat after the wall clock moves backward', (): void => {
	const auto = new AutoStart();
	auto.setTime('09:00', at(16, 8, 59));
	assert.equal(auto.shouldStart(at(16, 9, 0), true), true);
	assert.equal(auto.shouldStart(at(16, 8, 59), true), false);
	assert.equal(auto.shouldStart(at(16, 9, 0), true), false);
});

test('validates input and supports changing or clearing the selected time', (): void => {
	const auto = new AutoStart();
	assert.equal(auto.setTime('09:00', at(16, 8, 0)), true);
	for (const invalid of ['', '9:00', '24:00', '09:60', '09:00:00']) {
		assert.equal(auto.setTime(invalid, at(16, 8, 30)), false);
	}
	assert.equal(auto.shouldStart(at(16, 9, 0), true), true);
	auto.setTime('10:00', at(16, 9, 1));
	assert.equal(auto.shouldStart(at(16, 10, 0), true), true);
	auto.setTime(null, at(16, 10, 1));
	assert.equal(auto.shouldStart(at(17, 10, 0), true), false);
});

test('resumes existing elapsed time and does not undo a manual pause five seconds later', (): void => {
	let clock: number = 0;
	const engine = new TimerEngine([{ minutes: 10, divisions: 1 }], (): number => clock);
	const auto = new AutoStart();
	engine.start();
	clock = 120_000;
	engine.pause();
	auto.setTime('09:00', at(16, 8, 59));
	const refresh = (now: Date): void => {
		engine.tick();
		if (auto.shouldStart(now, engine.snapshot().status === 'paused')) engine.start();
	};
	refresh(at(16, 9, 0));
	assert.equal(engine.snapshot().status, 'running');
	assert.equal(engine.snapshot().elapsedMs, 120_000);
	clock += 5_000;
	engine.pause();
	refresh(at(16, 9, 0, 5));
	assert.equal(engine.snapshot().status, 'paused');
	refresh(at(17, 9, 0));
	assert.equal(engine.snapshot().status, 'running');
	assert.equal(engine.snapshot().elapsedMs, 125_000);
});

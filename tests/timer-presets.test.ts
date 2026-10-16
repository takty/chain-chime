import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TimerPresets, parsePreset } from '../src/logic/timer-presets.ts';
import { serializeTimers, writeTimers } from '../src/logic/url.ts';

function setup(initial: string | null = null) {
	let raw: string | null = initial;
	let writes: number = 0;
	let fail: boolean = false;
	const storage = {
		read: (): string | null => raw,
		write: (value: string): void => {
			if (fail) throw new Error('Storage unavailable');
			raw = value;
			writes++;
		},
	};
	return { presets: new TimerPresets(storage), storage, writes: () => writes, fail: () => { fail = true; } };
}

test('saves canonical URL values and restores them from storage without duplicate entries', (): void => {
	const { presets, storage, writes } = setup();
	presets.load();
	assert.deepEqual(presets.values(), []);
	const timers = [{ minutes: 1, divisions: 1 }, { minutes: 50, divisions: 3 }, { minutes: 30, divisions: 1 }];
	presets.save(timers);
	assert.deepEqual(presets.values(), ['1_50-3_30']);
	assert.equal(new URL(writeTimers('https://example.test/', timers)).searchParams.get('ts'), presets.values()[0]);
	presets.save(timers);
	assert.equal(writes(), 1);
	const restored = new TimerPresets(storage);
	restored.load();
	assert.deepEqual(restored.values(), presets.values());
	assert.deepEqual(parsePreset(restored.values()[0]), timers);
});

test('recognizes matching edited configurations and deletes only the saved entry', (): void => {
	const { presets, storage } = setup('["10_20","30"]');
	presets.load();
	const timers = [{ minutes: 10, divisions: 1 }, { minutes: 21, divisions: 1 }];
	assert.equal(presets.values().includes(serializeTimers(timers)), false);
	timers[1].minutes = 20;
	assert.equal(presets.values().includes(serializeTimers(timers)), true);
	presets.remove(serializeTimers(timers));
	assert.deepEqual(presets.values(), ['30']);
	assert.equal(storage.read(), '["30"]');
	assert.equal(serializeTimers(timers), '10_20');
});

test('filters invalid saved entries and normalizes equivalent settings', (): void => {
	const { presets } = setup('["10-1","10-0","10",null,42,"abc","61","0","10-21","10__20"]');
	presets.load();
	assert.deepEqual(presets.values(), ['10']);
	assert.equal(parsePreset(Array(11).fill('10').join('_')), null);
	assert.equal(parsePreset(''), null);
	assert.equal(parsePreset('10-2.5'), null);
	const copy = presets.values();
	copy.length = 0;
	assert.deepEqual(presets.values(), ['10']);
});

test('reports corrupt storage and leaves it untouched on load', (): void => {
	for (const raw of ['{', '{}']) {
		const { presets, storage, writes } = setup(raw);
		assert.throws(() => presets.load());
		assert.equal(writes(), 0);
		assert.equal(storage.read(), raw);
	}
});

test('failed persistence does not falsely add or delete a visible entry', (): void => {
	const { presets, fail, storage } = setup('["10"]');
	presets.load();
	fail();
	assert.throws(() => presets.save([{ minutes: 20, divisions: 1 }]));
	assert.deepEqual(presets.values(), ['10']);
	assert.throws(() => presets.remove('10'));
	assert.deepEqual(presets.values(), ['10']);
	assert.equal(storage.read(), '["10"]');
});

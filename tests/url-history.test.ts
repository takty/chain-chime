import assert from 'node:assert/strict';
import { test } from 'node:test';
import { UrlHistory } from '../src/ui/url-history.ts';

function fixture() {
	let url: string = 'https://example.test/?ts=3';
	let nextId: number = 0;
	const entries: string[] = [url];
	const tasks = new Map<number, () => void>();
	const errors: string[] = [];
	const history = new UrlHistory({
		currentUrl: (): string => url,
		push: (next: string): void => { url = next; entries.push(next); },
		schedule: (callback: () => void, delayMs: number): number => {
			assert.equal(delayMs, 800);
			tasks.set(++nextId, callback);
			return nextId;
		},
		cancel: (id: number): void => { tasks.delete(id); },
		report: (error: string): void => { errors.push(error); },
	});
	return { history, entries, tasks, errors };
}

test('groups rapid numeric edits and keeps the original entry until idle', (): void => {
	const { history, entries, tasks } = fixture();
	history.update('https://example.test/?ts=4', true);
	history.update('https://example.test/?ts=5', true);
	assert.equal(entries.length, 1);
	assert.equal(tasks.size, 1);
	for (const callback of [...tasks.values()]) callback();
	assert.deepEqual(entries, ['https://example.test/?ts=3', 'https://example.test/?ts=5']);
	assert.equal(tasks.size, 0);
});

test('commits numeric edits before structural changes and playback actions', (): void => {
	const { history, entries, tasks } = fixture();
	history.update('https://example.test/?ts=5', true);
	history.flush();
	history.update('https://example.test/?ts=5_3');
	assert.deepEqual(entries, ['https://example.test/?ts=3', 'https://example.test/?ts=5', 'https://example.test/?ts=5_3']);
	assert.equal(tasks.size, 0);
	history.flush();
	assert.equal(entries.length, 3);
});

test('skips identical URLs including a numeric edit that returns to its original value', (): void => {
	const { history, entries } = fixture();
	history.update('https://example.test/?ts=4', true);
	history.update('https://example.test/?ts=3', true);
	history.flush();
	history.update('https://example.test/?ts=3');
	assert.equal(entries.length, 1);
});

test('discards pending edits when navigating back or disposing the UI', (): void => {
	const { history, entries, tasks } = fixture();
	history.update('https://example.test/?ts=4', true);
	history.discard();
	history.flush();
	assert.equal(tasks.size, 0);
	assert.equal(entries.length, 1);
});

test('reports browser history failures without throwing from an action', (): void => {
	let error: string = '';
	const history = new UrlHistory({
		currentUrl: (): string => 'https://example.test/?ts=3',
		push: (): void => { throw new Error('History unavailable'); },
		schedule: (): number => 1,
		cancel: (): void => {},
		report: (value: string): void => { error = value; },
	});
	assert.doesNotThrow((): void => history.update('https://example.test/?ts=4'));
	assert.match(error, /URL could not be updated/);
});
